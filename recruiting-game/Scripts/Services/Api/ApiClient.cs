using Godot;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System;

namespace RecruitingGame.Services
{
    public static class ApiClient
    {
        private static readonly System.Net.Http.HttpClient client = new System.Net.Http.HttpClient()
        {
            Timeout = TimeSpan.FromSeconds(10)
        };

        private static string GetApiUrl()
        {
            return System.Environment.GetEnvironmentVariable("API_URL") ?? "http://localhost:5000";
        }

        /// <summary>
        /// Tests basic connectivity to the API
        /// </summary>
        public static async Task<bool> TestConnectionAsync()
        {
            try
            {
                GD.Print($"Testing API connectivity to: {GetApiUrl()}...");
                var testRequest = new HttpRequestMessage(HttpMethod.Get, $"{GetApiUrl()}/");
                using var response = await client.SendAsync(testRequest);

                if (response.IsSuccessStatusCode)
                {
                    GD.Print("API connection successful");
                    return true;
                }
                else
                {
                    GD.Print($"API returned status: {response.StatusCode}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                GD.Print($"API connection failed: {ex.Message}");
                GD.Print("Make sure to API server is running and API_URL is set correctly");
                return false;
            }
        }

        /// <summary>
        /// Sends HTTP request with retry logic
        /// </summary>
        private static async Task<HttpResponseMessage> SendWithRetry(HttpRequestMessage request, int maxRetries = 3)
        {
            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    var response = await client.SendAsync(request);
                    return response;
                }
                catch (HttpRequestException ex) when (attempt < maxRetries)
                {
                    GD.Print($"Request attempt {attempt} failed: {ex.Message}. Retrying...");
                    await Task.Delay(1000 * attempt);
                }
            }
            throw new HttpRequestException("All retry attempts failed");
        }

        /// <summary>
        /// Base method for sending DELETE requests
        /// </summary>
        public static async Task<bool> DeleteAsync(string endpoint)
        {
            try
            {
                var request = new HttpRequestMessage(HttpMethod.Delete, $"{GetApiUrl()}{endpoint}");
                var response = await SendWithRetry(request);
                
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                GD.Print($"DELETE request failed: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Base method for sending POST requests
        /// </summary>
        public static async Task<bool> PostAsync(string endpoint, string json)
        {
            try
            {
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var request = new HttpRequestMessage(HttpMethod.Post, $"{GetApiUrl()}{endpoint}")
                {
                    Content = content
                };

                using var response = await SendWithRetry(request);

                if (response.IsSuccessStatusCode)
                {
                    GD.Print($"Successfully sent to {endpoint}: {response.StatusCode}");
                    return true;
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    GD.PrintErr($"Failed to send to {endpoint}. Status: {response.StatusCode}, Error: {errorContent}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                GD.PrintErr($"Exception when sending to {endpoint}: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Base method for sending GET requests
        /// </summary>
        public static async Task<string> GetAsync(string endpoint)
        {
            try
            {
                GD.Print($"Fetching from {endpoint}...");
                var response = await client.GetAsync($"{GetApiUrl()}{endpoint}");
                
                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadAsStringAsync();
                }
                else
                {
                    GD.PrintErr($"Failed to fetch from {endpoint}. Status: {response.StatusCode}");
                    return null;
                }
            }
            catch (Exception ex)
            {
                GD.PrintErr($"Exception when fetching from {endpoint}: {ex.Message}");
                return null;
            }
        }
    }
}