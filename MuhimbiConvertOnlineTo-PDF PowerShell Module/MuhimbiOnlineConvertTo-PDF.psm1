# This Function converts Memory Stream to String, which we can use for catching Expection
function ConvertFrom-StreamToString
    {
    param(
    [parameter(Mandatory)][System.IO.MemoryStream]$inputStream
    )
    $reader = New-Object System.IO.StreamReader($inputStream);
    $inputStream.Position = 0;
    return $reader.ReadToEnd()
    } 
 
function MuhimbiConvertOnlineTo-PDF
    {
    [CmdletBinding()]
    param(
        [parameter(Mandatory=$true,helpmessage ='!!!! ENTER YOUR API KEY HERE !!!!')][String]$apikey,
        [parameter(Mandatory=$true,helpmessage ='Give me a path in format C:\Users\clavin.fernandes\Documents\somefile.docx')][String]$sourceFilePath,
        [parameter(Mandatory=$true,helpmessage ='Give me a path in format with extension .pdf C:\Users\clavin.fernandes\Documents\somefile.pdf')][String]$targetFilePath
    )
       try
            {
            #Converting File to Base64 bit
            $fileContentEncoded = [System.Convert]::ToBase64String([IO.File]::ReadAllBytes($sourceFilePath))
            #You REST-API call starts here
            $URL = "https://api.muhimbi.com/api/v1/operations/convert"
            $content = "application/json"
            $hdrs = @{}
            $hdrs.Add("API_KEY","$apikey") 
 
       $body =  ConvertTo-Json @{
            "use_async_pattern" = "false";
            "fail_on_error" = "true";
            # The format to convert the file
            "output_format" = "PDF";
            #file name with the correct extension
            "source_file_name"= [IO.Path]::GetFileName($sourceFilePath);
            #The file content to convert
            "source_file_content" = "$fileContentEncoded"
            } 
 
       $Content = Invoke-WebRequest -Method Post -Uri $URL -Headers $hdrs -Body $body -ContentType $content -TimeoutSec 3600 -UseBasicParsing
 
       #Getting the processed file
       $response = $Content.Content | ConvertFrom-Json
       $base64string = $response.processed_file_content
       #Converting the file from base64 and writing the file back to your target location
       [IO.File]::WriteAllBytes($targetFilePath, [Convert]::FromBase64String($base64string))
       }
       #Read the response and print the Error details
       catch
       {
           $DecryptedOutput = ConvertFrom-StreamToString -inputStream $Error[0].Exception.Response.GetResponseStream()
           $response = $DecryptedOutput | ConvertFrom-Json
           $response.result_details
       }
}