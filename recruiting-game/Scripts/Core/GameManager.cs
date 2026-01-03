using Godot;
using System.Collections.Generic;
using System;
using System.Linq;
using System.Threading.Tasks;

public static class GameManager
{
    public static int CurrentRound { get; private set; }
    public static CandidateData[] CurrentCandidates { get; private set; }
    public static CandidateData[] AvailableCandidates { get; private set; }
    public static int MaxRounds { get; private set; } = 10;
    private static Random _random = new Random();

    public static void Initialize()
    {
        CurrentRound = 1;
        CurrentCandidates = null;
        AvailableCandidates = null;
        MaxRounds = 5;
    }

    public static void SetSeed(int seed)
    {
        _random = new Random(seed);
        GD.Print($"GameManager seeded with: {seed}");
    }

    public static async Task LoadCandidatesAsync()
    {
        AvailableCandidates = CandidateLoader.GetAllCandidates();
        if (AvailableCandidates == null || AvailableCandidates.Length == 0)
        {
            GD.PrintErr("No candidates loaded!");
        }
        else
        {
            // Show available positions for debugging
            var positions = AvailableCandidates
                .GroupBy(c => c.position)
                .Select(g => $"{g.Key} ({g.Count()} candidates)")
                .ToList();
            GD.Print($"Available positions: {string.Join(", ", positions)}");
        }
    }

    public static async Task PrepareRoundCandidates()
    {
        if (CurrentRound > MaxRounds)
        {
            GD.Print("Game completed! Starting new game...");
            CurrentRound = 1;
            CurrentCandidates = null;
        }

        if (AvailableCandidates == null || AvailableCandidates.Length == 0)
        {
            await LoadCandidatesAsync();
        }

        if (AvailableCandidates == null || AvailableCandidates.Length == 0)
        {
            GD.PrintErr("No candidates available for round preparation!");
            return;
        }

        // Group candidates by position
        var positionGroups = AvailableCandidates
            .GroupBy(c => c.position)
            .Where(g => g.Count() >= 2) // Only consider positions with at least 2 candidates
            .ToList();

        if (positionGroups.Count == 0)
        {
            GD.PrintErr("No positions with at least 2 candidates available!");
            // Fallback to random selection if no similar pairs exist
            int resumeCount = Math.Min(2, AvailableCandidates.Length);
            var usedIndices = new HashSet<int>();
            CurrentCandidates = new CandidateData[resumeCount];

            for (int i = 0; i < resumeCount; i++)
            {
                int randomIndex;
                do
                {
                    randomIndex = _random.Next(AvailableCandidates.Length);
                } while (usedIndices.Contains(randomIndex));

                usedIndices.Add(randomIndex);
                CurrentCandidates[i] = AvailableCandidates[randomIndex];
            }
        }
        else
        {
            // Select a random position group that has at least 2 candidates
            var selectedGroup = positionGroups[_random.Next(positionGroups.Count)];
            var candidatesInPosition = selectedGroup.ToList();

            // Randomly select 2 candidates from the same position
            var selectedIndices = new HashSet<int>();
            CurrentCandidates = new CandidateData[2];

            for (int i = 0; i < 2; i++)
            {
                int randomIndex;
                do
                {
                    randomIndex = _random.Next(candidatesInPosition.Count);
                } while (selectedIndices.Contains(randomIndex));

                selectedIndices.Add(randomIndex);
                CurrentCandidates[i] = candidatesInPosition[randomIndex];
            }

            GD.Print($"Prepared 2 {selectedGroup.Key} candidates for round {CurrentRound}: {CurrentCandidates[0].candidateName} vs {CurrentCandidates[1].candidateName}");
        }
    }

    public static string SelectCandidate(string chosenCandidateId)
    {
        if (CurrentCandidates == null)
            return null;

        var rejectedCandidateId = "";
        var chosenCandidate = CurrentCandidates.FirstOrDefault(c => c.candidate_id == chosenCandidateId);
        if (chosenCandidate != null)
        {
            // Get the rejected candidate ID (the other candidate in the pair)
            var rejectedCandidate = CurrentCandidates.FirstOrDefault(c => c.candidate_id != chosenCandidateId);
            if (rejectedCandidate != null)
            {
                rejectedCandidateId = rejectedCandidate.candidate_id;
            }

            // Move chosen candidate to used candidates
            CurrentCandidates = CurrentCandidates.Where(c => c.candidate_id != chosenCandidateId).ToArray();

            // Add back to rejected candidate with small chance
            var availableCandidates = CandidateLoader.GetAllCandidates().Where(c => !CurrentCandidates.Any(used => used.candidate_id == c.candidate_id)).ToList();

            if (availableCandidates.Count > 0)
            {
                var comebackCandidate = availableCandidates[_random.Next(availableCandidates.Count)];
                var candidateList = CurrentCandidates.ToList();
                candidateList.Add(comebackCandidate);
                CurrentCandidates = candidateList.ToArray();
                // GD.Print($"Candidate {chosenCandidate.candidateName} may come back in future rounds");
            }
        }

        return rejectedCandidateId;
    }

    public static bool CheckRoundComplete()
    {
        var usedCandidateIds = new HashSet<string>();
        foreach (var candidate in CurrentCandidates)
        {
            if (candidate != null)
                usedCandidateIds.Add(candidate.candidate_id);
        }

        return usedCandidateIds.Count >= 2;
    }

    public static async void AdvanceRound()
    {
        CurrentRound++;
        GD.Print($"ADVANCING: Round {CurrentRound - 1} complete! Starting round {CurrentRound} (Max: {MaxRounds})");
        await PrepareRoundCandidates();
    }

    public static bool IsGameComplete()
    {
        GD.Print($"IsGameComplete: CurrentRound={CurrentRound}, MaxRounds={MaxRounds}, Result={CurrentRound > MaxRounds}");
        return CurrentRound > MaxRounds;
    }

    public static void ResetGame()
    {
        CurrentRound = 1;
        CurrentCandidates = null;
        AvailableCandidates = null;
    }
}