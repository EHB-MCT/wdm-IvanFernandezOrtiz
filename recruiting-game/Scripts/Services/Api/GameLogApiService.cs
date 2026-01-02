using Godot;
using Godot.Collections;
using System.Text.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RecruitingGame.Services;

namespace RecruitingGame.Services
{
    public static class GameLogApiService
    {
        /// <summary>
        /// Sends player choice log to API
        /// </summary>
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
                
                GD.Print($"Sending JSON: {json}");
                await ApiClient.PostAsync("/api/choices", json);
            }
            catch (Exception ex)
            {
                GD.PrintErr($"Error sending log data: {ex.Message}");
            }
        }

        /// <summary>
        /// Creates log data for player choice
        /// </summary>
        public static Godot.Collections.Dictionary CreateLogData(string chosenCandidateId, string rejectedCandidateId, string position, double timeTaken, 
            List<string> tabsViewed, int roundNumber)
        {
            return new Godot.Collections.Dictionary {
                {"player_id", "player_" + DateTime.Now.Ticks},
                {"chosen_candidate_id", chosenCandidateId},
                {"rejected_candidate_id", rejectedCandidateId ?? ""},
                {"position", position},
                {"time_taken", timeTaken},
                {"tabs_viewed", new Godot.Collections.Array(tabsViewed.Select(tab => (Variant)tab).ToArray())},
                {"round_number", roundNumber}
            };
        }

        /// <summary>
        /// Creates log data for timeout event
        /// </summary>
        public static Godot.Collections.Dictionary CreateTimeoutLogData(int roundNumber)
        {
            return new Godot.Collections.Dictionary {
                {"event", "timeout"},
                {"time_taken", 0},
                {"round_number", roundNumber}
            };
        }

        private static System.Collections.Generic.Dictionary<string, object> ConvertGodotDictionaryToCSharp(Godot.Collections.Dictionary data)
        {
            var logData = new System.Collections.Generic.Dictionary<string, object>();

            foreach (var key in data.Keys)
            {
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
    }
}