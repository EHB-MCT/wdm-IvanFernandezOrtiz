using Godot;
using Godot.Collections;
using System;
using System.Collections.Generic;
using System.Text.Json;

public partial class CandidateLoader : Node
{
    private static CandidateData[] _candidates;
    private static Random _random = new Random();

    public static void LoadCandidates()
    {
        try
        {
            var file = FileAccess.Open("res://data/candidates.json", FileAccess.ModeFlags.Read);
            if (file == null)
            {
                GD.PrintErr("Failed to open candidates.json file");
                return;
            }

            var jsonString = file.GetAsText();
            file.Close();

            _candidates = JsonSerializer.Deserialize<CandidateData[]>(jsonString);
            GD.Print($"Loaded {_candidates?.Length ?? 0} candidates");

            if (_candidates != null && _candidates.Length > 0)
            {
                for (int i = 0; i < Math.Min(3, _candidates.Length); i++)
                {
                    var candidate = _candidates[i];
                    GD.Print($"Candidate {i}: {candidate.candidateName}, Skills: {string.Join(", ", candidate.skills ?? new string[0])}");
                }
            }
        }
        catch (Exception ex)
        {
            GD.PrintErr($"Error loading candidates: {ex.Message}");
        }
    }

    public static CandidateData GetRandomCandidate()
    {
        if (_candidates == null || _candidates.Length == 0)
        {
            GD.PrintErr("No candidates loaded, returning default");
            return GetDefaultCandidate();
        }

        return _candidates[_random.Next(_candidates.Length)];
    }

    public static CandidateData[] GetAllCandidates()
    {
        return _candidates ?? new CandidateData[0];
    }

    private static CandidateData GetDefaultCandidate()
    {
        return new CandidateData
        {
            candidateName = "Default Candidate",
            position = "Developer",
            gender = "Unknown",
            education = "University",
            skills = new string[] { "C#", "Godot" },
            picturePath = "res://assets/icon.svg",
            workExperience = "No Experience"
        };
    }
}

public class CandidateData
{
    public string candidateName { get; set; }
    public string position { get; set; }
    public string gender { get; set; }
    public string education { get; set; }
    public string[] skills { get; set; }
    public string picturePath { get; set; }
    public string workExperience { get; set; }
}