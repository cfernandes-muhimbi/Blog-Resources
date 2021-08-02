using System.IO;
using System.Net;
using System.Runtime.InteropServices;
using System.Web.Script.Serialization;

namespace MuhimbiConvertUrlToPdf
{
    public class Class1
    {
        public static string convert_html_to_pdf(string API_Key, string Source_url, string Page_orientation, string Media_type, string Authentication_type, [Optional] string Username, [Optional] string Password1, [Optional] string Viewport_size)
        {
            string response;

            //** Convert Request Endpoint
            string client = "https://api.muhimbi.com/api/v1/operations/convert_html";
            WebRequest postwebRequest = WebRequest.Create(client);

            // ** Add POST Method
            postwebRequest.Method = "POST";

            // ** Add Headers
            postwebRequest.ContentType = "application/json";
            postwebRequest.Headers.Add("API_KEY", API_Key);

            // ** Create JSON body
            string postData = @"{
                ""use_async_pattern"": ""false"",
                 ""source_url_or_html"": """ + Source_url + @""",
                 ""page_orientation"": """ + Page_orientation + @""",
                 ""media_type"": """ + Media_type + @""",
                 ""authentication_type"": """ + Authentication_type + @""",
                 ""username"": """ + Username + @""",
                 ""password"": """ + Password1 + @""",
                 ""viewport_size"": """ + Viewport_size + @""",
                 ""conversion_delay"": 5000,
                 ""fail_on_error"": ""true"",
                }";

            // ** Add Json Body
            // ** Execute the request
            using (var streamWriter = new StreamWriter(postwebRequest.GetRequestStream()))
            {
                streamWriter.Write(postData);
                streamWriter.Flush();
                streamWriter.Close();

                var httpresponse = postwebRequest.GetResponse();

                using (var streamreader = new StreamReader(httpresponse.GetResponseStream()))
                {
                    response = streamreader.ReadToEnd();
                }
                // ** Deserialize the response 
                JavaScriptSerializer ser = new JavaScriptSerializer();
                var conversion_response = ser.Deserialize<Output>(response);
                Output output = new Output();
                //var a = conversion_response.processed_file_content;
                return conversion_response.processed_file_content;
            }

        }

    }
}
