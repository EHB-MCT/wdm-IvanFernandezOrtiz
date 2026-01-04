using Godot;
using System;
using System.Text.Json;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

public partial class CandidateLoader : Node
{
    private static CandidateData[] _candidates;
    private static Random _random = new Random();

    public static async Task LoadCandidatesAsync()
    {
        try
        {
            GD.Print("Loading candidates from API...");
            
            // First try to load from API
            var candidates = await ApiService.GetAllCandidatesAsync();
            
            if (candidates != null && candidates.Count > 0)
            {
                _candidates = candidates.ToArray();
                GD.Print($"Successfully loaded {_candidates.Length} candidates from API");
                
                // Show position distribution for debugging
                var positionCounts = _candidates
                    .GroupBy(c => c.position)
                    .Select(g => $"{g.Key} ({g.Count()})");
                GD.Print($"Position distribution: {string.Join(", ", positionCounts)}");
                
                return;
            }
            
            GD.Print("API load failed, falling back to local JSON file...");
            await LoadFromLocalFileAsync();
        }
        catch (Exception ex)
        {
            GD.PrintErr($"Error loading candidates from API: {ex.Message}");
            GD.Print("Falling back to local JSON file...");
            await LoadFromLocalFileAsync();
        }
    }

    private static async Task LoadFromLocalFileAsync()
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
            GD.Print($"Loaded {_candidates?.Length ?? 0} candidates from local file");
        }
        catch (Exception ex)
        {
            GD.PrintErr($"Error loading local candidates: {ex.Message}");
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
            candidate_id = "DEFAULT001",
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
    public string candidate_id { get; set; }
    public string candidateName { get; set; }
    public string position { get; set; }
    public string gender { get; set; }
    public int age { get; set; }
    public string race { get; set; }
    public string education { get; set; }
    public string[] skills { get; set; }
    public string picturePath { get; set; }
    public string workExperience { get; set; }
}