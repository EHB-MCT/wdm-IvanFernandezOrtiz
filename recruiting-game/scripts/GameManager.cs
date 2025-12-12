using Godot;
using System.Collections.Generic;
using System;
using System.Linq;

public static class GameManager
{
    public static int CurrentRound { get; private set; }
    public static CandidateData[] CurrentCandidates { get; private set; }
    public static CandidateData[] AvailableCandidates { get; private set; }
    public static int MaxRounds { get; private set; } = 5;
    private static readonly Random _random = new Random();

    public static void Initialize()
    {
        CurrentRound = 1;
        CurrentCandidates = null;
        AvailableCandidates = null;
        MaxRounds = 5;
    }

    public static void LoadCandidates()
    {
        CandidateLoader.LoadCandidates();
        AvailableCandidates = CandidateLoader.GetAllCandidates();
        if (AvailableCandidates == null || AvailableCandidates.Length == 0)
        {
            GD.PrintErr("No candidates loaded!");
        }
    }

    public static void PrepareRoundCandidates()
    {
        if (CurrentRound > MaxRounds)
        {
            GD.Print("Game completed! Starting new game...");
            CurrentRound = 1;
            CurrentCandidates = null;
        }

        if (AvailableCandidates == null || AvailableCandidates.Length == 0)
        {
            LoadCandidates();
        }

        if (AvailableCandidates == null || AvailableCandidates.Length == 0)
        {
            GD.PrintErr("No candidates available for round preparation!");
            return;
        }

        // Create exactly 2 random candidates for this round
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

        GD.Print($"Prepared {resumeCount} candidates for round {CurrentRound}");
    }

    public static void SelectCandidate(string chosenCandidateId)
    {
        if (CurrentCandidates == null)
            return;

        var chosenCandidate = CurrentCandidates.FirstOrDefault(c => c.candidate_id == chosenCandidateId);
        if (chosenCandidate != null)
        {
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
                GD.Print($"Candidate {chosenCandidate.candidateName} may come back in future rounds");
            }
        }
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

    public static void AdvanceRound()
    {
        CurrentRound++;
        GD.Print($"Round {CurrentRound - 1} complete! Starting round {CurrentRound}");
        PrepareRoundCandidates();
    }

    public static bool IsGameComplete()
    {
        return CurrentRound > MaxRounds;
    }

    public static void ResetGame()
    {
        CurrentRound = 1;
        CurrentCandidates = null;
        AvailableCandidates = null;
    }
}