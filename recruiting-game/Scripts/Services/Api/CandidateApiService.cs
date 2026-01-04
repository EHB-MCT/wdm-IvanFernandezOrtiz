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
    public static class CandidateApiService
    {
        /// <summary>
        /// Sends batch of candidates to API
        /// </summary>
        public static async Task<bool> SendCandidatesBatchAsync(Dictionary candidatesData)
        {
            try
            {
                GD.Print("Sending candidates batch to API...");
                
                var json = JsonSerializer.Serialize(candidatesData, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
                
                return await ApiClient.PostAsync("/api/candidates/batch", json);
            }
            catch (Exception ex)
            {
                GD.PrintErr($"Exception when sending candidates batch: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Retrieves all candidates from API
        /// </summary>
        public static async Task<List<CandidateData>> GetAllCandidatesAsync()
        {
            try
            {
                var jsonContent = await ApiClient.GetAsync("/api/candidates");
                
                if (jsonContent == null)
                {
                    return new List<CandidateData>();
                }
                
                var candidates = JsonSerializer.Deserialize<List<CandidateData>>(jsonContent, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
                
                GD.Print($"Successfully fetched {candidates?.Count ?? 0} candidates from API");
                return candidates ?? new List<CandidateData>();
            }
            catch (Exception ex)
            {
                GD.PrintErr($"Exception when fetching candidates from API: {ex.Message}");
                return new List<CandidateData>();
            }
        }

        /// <summary>
        /// Builds candidates batch request data from list of candidates
        /// </summary>
        public static Dictionary BuildCandidatesBatchRequest(List<CandidateData> candidates)
        {
            var requestData = new Godot.Collections.Dictionary
            {
                ["candidates"] = new Godot.Collections.Array()
            };

            foreach (var candidate in candidates)
            {
                var candidateDict = new Godot.Collections.Dictionary
                {
                    ["candidate_id"] = candidate.candidate_id,
                    ["candidateName"] = candidate.candidateName,
                    ["position"] = candidate.position,
                    ["gender"] = candidate.gender,
                    ["education"] = candidate.education,
                    ["workExperience"] = candidate.workExperience,
                    ["picturePath"] = candidate.picturePath,
                    ["skills"] = new Godot.Collections.Array(candidate.skills.Select(s => (Godot.Variant)s).ToArray())
                };
                ((Godot.Collections.Array)requestData["candidates"]).Add(candidateDict);
            }

            return requestData;
        }

        /// <summary>
        /// Generate random candidates on the server
        /// </summary>
        public static async Task<bool> GenerateCandidatesAsync(int count = 100, int? seed = null)
        {
            try
            {
                GD.Print($"Generating {count} candidates with seed: {(seed.HasValue ? seed.Value.ToString() : "random")}");
                
                var url = "/api/candidates/generate";
                if (count != 100 || seed.HasValue)
                {
                    url += $"?count={count}";
                    if (seed.HasValue)
                    {
                        url += $"&seed={seed.Value}";
                    }
                }
                
                var response = await ApiClient.GetAsync(url);
                if (response != null)
                {
                    GD.Print("Candidates generated successfully");
                    return true;
                }
                
                GD.PrintErr("Failed to generate candidates");
                return false;
            }
            catch (System.Exception ex)
            {
                GD.PrintErr($"Exception when generating candidates: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Clear all candidates from the server
        /// </summary>
        public static async Task<bool> ClearCandidatesAsync()
        {
            try
            {
                GD.Print("Clearing all candidates from server...");
                
                var response = await ApiClient.DeleteAsync("/api/candidates/clear");
                if (response != null)
                {
                    GD.Print("Candidates cleared successfully");
                    return true;
                }
                
                GD.PrintErr("Failed to clear candidates");
                return false;
            }
            catch (System.Exception ex)
            {
                GD.PrintErr($"Exception when clearing candidates: {ex.Message}");
                return false;
            }
        }
    }
}