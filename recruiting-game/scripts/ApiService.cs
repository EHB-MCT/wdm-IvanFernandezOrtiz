using Godot;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Linq;

public static class ApiService
{
    private static readonly System.Net.Http.HttpClient client = new System.Net.Http.HttpClient()
    {
        Timeout = TimeSpan.FromSeconds(10)
    };

    private static string GetApiUrl()
    {
        return System.Environment.GetEnvironmentVariable("API_URL") ?? "http://localhost:5000";
    }

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

    public static async Task SendLogAsync(Godot.Collections.Dictionary data)
    {
        try
        {
            var logData = ConvertGodotDictionaryToCSharp(data);
            var json = JsonSerializer.Serialize(logData, new JsonSerializerOptions
            {
                WriteIndented = false,
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
            });
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            GD.Print($"Sending JSON: {json}");

            var request = new HttpRequestMessage(HttpMethod.Post, $"{GetApiUrl()}/api/choices")
            {
                Content = content
            };

            using var response = await SendWithRetry(request);

            if (response.IsSuccessStatusCode)
            {
                GD.Print("Log sent successfully");
                var responseContent = await response.Content.ReadAsStringAsync();
                GD.Print($"Response: {responseContent}");
            }
            else
            {
                GD.Print($"Failed to log data: {response.StatusCode}");
                var errorContent = await response.Content.ReadAsStringAsync();
                GD.Print($"Error response: {errorContent}");
            }
        }
        catch (HttpRequestException ex)
        {
            GD.Print($"HTTP Request Exception: {ex.Message}");
            GD.Print("This might be a network connectivity issue or API server is not running.");
        }
        catch (TaskCanceledException ex)
        {
            GD.Print($"Request Timeout: {ex.Message}");
            GD.Print("The API request timed out. Check if the server is responding.");
        }
        catch (Exception ex)
        {
            GD.Print($"Unexpected error: {ex.Message}");
            GD.Print($"Stack trace: {ex.StackTrace}");
        }
    }

    private static Dictionary<string, object> ConvertGodotDictionaryToCSharp(Godot.Collections.Dictionary data)
    {
        var logData = new Dictionary<string, object>();

        foreach (var key in data.Keys)
        {
            GD.Print($"KEY = {key}, VALUE = {data[key]}");

            var value = data[key];

            switch (value.VariantType)
            {
                case Variant.Type.String:
                    logData[key.ToString()] = (string)value;
                    break;

                case Variant.Type.Int:
                    logData[key.ToString()] = (int)value;
                    break;

                case Variant.Type.Array:
                    var arr = (Godot.Collections.Array)value;
                    var stringList = new List<string>();
                    foreach (var item in arr)
                        stringList.Add(item.ToString());
                    logData[key.ToString()] = stringList.ToArray();
                    break;

                case Variant.Type.Float:
                    logData[key.ToString()] = (double)value;
                    break;

                default:
                    logData[key.ToString()] = value.ToString();
                    break;
            }
        }

        return logData;
    }

    public static Godot.Collections.Dictionary CreateLogData(string chosenCandidateId, string position, double timeTaken, List<string> tabsViewed, int roundNumber)
    {
        return new Godot.Collections.Dictionary {
            {"player_id", "player_" + DateTime.Now.Ticks},
            {"chosen_candidate_id", chosenCandidateId},
            {"rejected_candidate_id", ""},
            {"position", position},
            {"time_taken", timeTaken},
            {"tabs_viewed", new Godot.Collections.Array(tabsViewed.Select(tab => (Variant)tab).ToArray())},
            {"round_number", roundNumber}
        };
    }

    public static Godot.Collections.Dictionary CreateTimeoutLogData(int roundNumber)
    {
        return new Godot.Collections.Dictionary {
            {"event", "timeout"},
            {"time_taken", 0},
            {"round_number", roundNumber}
        };
    }
}