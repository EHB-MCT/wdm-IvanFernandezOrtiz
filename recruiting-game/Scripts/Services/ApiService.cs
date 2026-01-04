using Godot;
using Godot.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using RecruitingGame.Services;

/// <summary>
/// Backward compatibility facade for API operations.
/// Routes calls to new specialized service classes.
/// </summary>
public static class ApiService
{
    /// <summary>
    /// Legacy method - redirects to ApiClient
    /// </summary>
    public static async Task<bool> TestConnectionAsync()
    {
        return await ApiClient.TestConnectionAsync();
    }

    /// <summary>
    /// Legacy method - redirects to GameLogApiService
    /// </summary>
    public static async Task SendLogAsync(Godot.Collections.Dictionary data)
    {
        await GameLogApiService.SendLogAsync(data);
    }

    /// <summary>
    /// Legacy method - redirects to CandidateApiService
    /// </summary>
    public static async Task<bool> SendCandidatesBatchAsync(Godot.Collections.Dictionary candidatesData)
    {
        return await CandidateApiService.SendCandidatesBatchAsync(candidatesData);
    }

    /// <summary>
    /// Legacy method - redirects to CandidateApiService
    /// </summary>
    public static async Task<List<CandidateData>> GetAllCandidatesAsync()
    {
        return await CandidateApiService.GetAllCandidatesAsync();
    }

    /// <summary>
    /// Generate random candidates on the server
    /// </summary>
    public static async Task<bool> GenerateCandidatesAsync(int count = 100, int? seed = null)
    {
        return await CandidateApiService.GenerateCandidatesAsync(count, seed);
    }

    /// <summary>
    /// Clear all candidates from the server
    /// </summary>
    public static async Task<bool> ClearCandidatesAsync()
    {
        return await CandidateApiService.ClearCandidatesAsync();
    }

    /// <summary>
    /// Legacy method - redirects to GameLogApiService
    /// </summary>
    public static Godot.Collections.Dictionary CreateLogData(string chosenCandidateId, string rejectedCandidateId, string position, double timeTaken, 
        List<string> tabsViewed, int roundNumber)
    {
        return GameLogApiService.CreateLogData(chosenCandidateId, rejectedCandidateId, position, timeTaken, tabsViewed, roundNumber);
    }

    /// <summary>
    /// Legacy method - redirects to GameLogApiService
    /// </summary>
    public static Godot.Collections.Dictionary CreateTimeoutLogData(int roundNumber)
    {
        return GameLogApiService.CreateTimeoutLogData(roundNumber);
    }
}