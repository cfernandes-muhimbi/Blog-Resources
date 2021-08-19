using System;
using System.IO;
using System.Net;
using System.ServiceModel;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using ServiceReference1;

namespace MuhimbiConvertFunction
{
    public static class Function1
    {
        static string SERVICE_URL = "http://52.170.83.251:41734/Muhimbi.DocumentConverter.WebService/";

        [FunctionName("ConvertToPDF")]
        [OpenApiOperation(operationId: "ConvertToPDF")]
        [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, Name = "code", In = OpenApiSecurityLocationType.Query)]
        [OpenApiRequestBody("application/json", typeof(RequestBodyModel), Description = "JSON request body containing { FileName, FileContent}")]
        //[OpenApiParameter(name: "name", In = ParameterLocation.Query, Required = true, Type = typeof(string), Description = "The **Name** parameter")]
        //[OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "text/plain", bodyType: typeof(string), Description = "The OK response")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ResponseBodyModel), Description = "JSON OK response")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ResponseBodyModel), Description = "JSON BAD response")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            // ** Get request body data.
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);
            string FileName = data?.fileName;
            string FileContent = data?.fileContent;
            byte[] convFile = null;
            
            DocumentConverterServiceClient client = null;
            try
            {
                byte[] sourceFile = Convert.FromBase64String(FileContent);

                // ** Open the service and configure the bindings
                client = OpenService(SERVICE_URL);

                //** Set the absolute minimum open options
                OpenOptions openOptions = new OpenOptions();
                openOptions.OriginalFileName = FileName;
                openOptions.FileExtension = Path.GetExtension(FileName);

                // ** Set the absolute minimum conversion settings.
                ConversionSettings conversionSettings = new ConversionSettings();
                conversionSettings.Fidelity = ConversionFidelities.Full;
                conversionSettings.Quality = ConversionQuality.OptimizeForPrint;

                convFile = client.ConvertAsync(sourceFile, openOptions, conversionSettings).GetAwaiter().GetResult();
            }
            catch (Exception ex)
            {              
                return new BadRequestObjectResult(new
                {
                    message = ex.ToString()
                }) ;
            }
            finally
            {
                CloseService(client);
            }
            return (ActionResult)new OkObjectResult(new
            {
                processed_file_content = convFile,
            });
        }
        public static DocumentConverterServiceClient OpenService(string address)
        {
            DocumentConverterServiceClient client = null;

            try
            {
                BasicHttpBinding binding = new BasicHttpBinding();

                // ** Use standard Windows Security.
                binding.Security.Mode = BasicHttpSecurityMode.TransportCredentialOnly;
                binding.Security.Transport.ClientCredentialType = HttpClientCredentialType.Windows;

                // ** Increase the client Timeout to deal with (very) long running requests.
                binding.SendTimeout = TimeSpan.FromMinutes(120);
                binding.ReceiveTimeout = TimeSpan.FromMinutes(120);

                // ** Set the maximum document size to 50MB
                binding.MaxReceivedMessageSize = 50 * 1024 * 1024;
                binding.ReaderQuotas.MaxArrayLength = 50 * 1024 * 1024;
                binding.ReaderQuotas.MaxStringContentLength = 50 * 1024 * 1024;

                // ** Specify an identity (any identity) in order to get it past .net3.5 sp1
                EndpointIdentity epi = new UpnEndpointIdentity("unknown");
                EndpointAddress epa = new EndpointAddress(new Uri(address), epi);

                client = new DocumentConverterServiceClient(binding, epa);
                client.OpenAsync().GetAwaiter().GetResult();

                return client;
            }
            catch (Exception)
            {
                CloseService(client);
                throw;
            }
        }
        public static void CloseService(DocumentConverterServiceClient client)
        {
            if (client != null && client.State == CommunicationState.Opened)
            client.CloseAsync().GetAwaiter().GetResult();
        }
    }
    public class ResponseBodyModel
    {
        public string processed_file_content { get; set; }
        public string message { get; set; }
    }
    public class RequestBodyModel
        {
            public string FileName { get; set; }
            public string FileContent { get; set; }
        }      
}

