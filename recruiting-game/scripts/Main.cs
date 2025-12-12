using Godot;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;
using System;
using System.Linq;

public partial class Main : Node
{

    private Label _MessageLabel;
    private Timer timer;
    private Label _TimeLeftLabel;
    private PackedScene _resumeScene;

    private Marker2D PositionA;
    private Marker2D PositionB;
    
    private CandidateData[] currentCandidates;
    private int currentRound = 1;

    public override void _Ready()
    {
        // Load candidates from JSON
        CandidateLoader.LoadCandidates();

        // Cache common nodes if they exist in the scene
        timer = GetNodeOrNull<Timer>("Timer");
        _MessageLabel = GetNode<Label>("Text");
        _TimeLeftLabel = GetNode<Label>("TimeLeft");

        // Get marker references for positioning
        PositionA = GetNode<Marker2D>("Option1");
        PositionB = GetNode<Marker2D>("Option2");

        // Load the Resume scene for instantiation
        _resumeScene = GD.Load<PackedScene>("res://scenes/resume.tscn");

        // Start the game
        NewGame();
    }

    private void NewGame()
    {
        // Clear existing resumes
        foreach (Node child in GetChildren())
        {
            if (child is Resume)
            {
                child.QueueFree();
            }
        }
        // Get random candidates and create resumes
        var allCandidates = CandidateLoader.GetAllCandidates();
        if (allCandidates.Length == 0)
        {
            GD.PrintErr("No candidates loaded!");
            return;
        }

        // Create exactly 2 random resumes for the game
        int resumeCount = Math.Min(2, allCandidates.Length);
        var usedIndices = new System.Collections.Generic.HashSet<int>();
        var random = new Random();
        currentCandidates = new CandidateData[resumeCount];

        for (int i = 0; i < resumeCount; i++)
        {
            int randomIndex;
            do
            {
                randomIndex = random.Next(allCandidates.Length);
            } while (usedIndices.Contains(randomIndex));

            usedIndices.Add(randomIndex);
            var candidate = allCandidates[randomIndex];
            currentCandidates[i] = candidate;

            var resumeInstance = _resumeScene.Instantiate<Resume>();
            AddChild(resumeInstance);

            // Position the resume at the appropriate marker
            Marker2D targetMarker = (i == 0) ? PositionA : PositionB;
            if (targetMarker != null)
            {
                resumeInstance.Position = targetMarker.Position;
                GD.Print($"Resume {i + 1} positioned at marker: {targetMarker.Name} at position {targetMarker.Position}");
            }
            else
            {
                GD.PrintErr($"Marker {(i == 0 ? "Option1" : "Option2")} not found!");
                // Fallback positioning
                resumeInstance.Position = new Vector2(i == 0 ? 155 : 672, 155);
            }

            // Set scale to match the original design
            resumeInstance.Scale = new Vector2(0.9f, 0.9f);

            resumeInstance.SetResumeData(
                candidate.candidate_id,
                candidate.candidateName,
                candidate.position,
                candidate.gender,
                candidate.education,
                candidate.skills,
                candidate.picturePath,
                candidate.workExperience
            );
            resumeInstance.ResumeChosen += OnResumeChosen;
        }

        GetNode<Timer>("Timer").Start();
    }

    /// <summary>
    /// Refresh the game with 2 new random candidates.
    /// </summary>
    public void RefreshCandidates()
    {
        GD.Print("Refreshing candidates...");
        NewGame();
    }



    private static readonly System.Net.Http.HttpClient client = new System.Net.Http.HttpClient();

    public override void _Process(double delta)
    {
        // Show remaining time if we have a timer and a label
        if (timer != null && _TimeLeftLabel != null)
        {
            // TimeLeft is a double; show as whole seconds remaining
            var left = Math.Ceiling(timer.TimeLeft);
            _TimeLeftLabel.Text = $"Time left: {left}s";
        }
    }

    private async void OnResumeChosen(Godot.Collections.Dictionary data)
    {

        GD.Print("Main received chosen candidate");

        // Ensure we have a timer reference
        if (timer == null)
            timer = GetNode<Timer>("Timer");

        // Get the chosen candidate ID from the data
        string chosenCandidateId = data["candidate_id"].ToString();
        
        // Find the rejected candidate (the other one)
        string rejectedCandidateId = null;
        foreach (var candidate in currentCandidates)
        {
            if (candidate.candidate_id != chosenCandidateId)
            {
                rejectedCandidateId = candidate.candidate_id;
                break;
            }
        }

        // Convert tabs_viewed from Godot Array to string array with correct enum values
        var tabsViewed = new List<string>();
        if (data.ContainsKey("tabs_viewed"))
        {
            var tabsArray = (Godot.Collections.Array)data["tabs_viewed"];
            foreach (var tab in tabsArray)
            {
                string tabStr = tab.ToString().ToUpper();
                // Map tab names to enum values
                if (tabStr == "PROFILE") tabsViewed.Add("PROFILE");
                else if (tabStr == "EDUCATION") tabsViewed.Add("EDUCATION");
                else if (tabStr == "SKILLS") tabsViewed.Add("SKILLS");
                else if (tabStr == "WORK") tabsViewed.Add("WORK");
            }
        }

        // Create the proper API data structure
        var logData = new Godot.Collections.Dictionary {
            {"player_id", "player_" + DateTime.Now.Ticks},
            {"chosen_candidate_id", chosenCandidateId},
            {"rejected_candidate_id", rejectedCandidateId},
            {"position", data["candidate_position"].ToString()},
            {"time_taken", timer != null ? timer.TimeLeft : 0},
            {"tabs_viewed", new Godot.Collections.Array(tabsViewed.Select(tab => (Variant)tab).ToArray())},
            {"round_number", currentRound}
        };

        await SendLog(logData);
        
        // Increment round for next choice
        currentRound++;
    }

    public async Task SendLog(Godot.Collections.Dictionary data)
    {
        // Convert Godot Dictionary → C# Dictionary<string, object>
        var logData = new Dictionary<string, object>();

        foreach (var key in data.Keys)
        {
            GD.Print($"KEY = {key}, VALUE = {data[key]}");

            var value = data[key];
            // logData[key.ToString()] = value.ToString();

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

                    // check if it's an array of strings
                    var stringList = new List<string>();
                    foreach (var item in arr)
                        stringList.Add(item.ToString());

                    logData[key.ToString()] = stringList.ToArray();
                    break;

                case Variant.Type.Float:
                    // store as double for JSON serializer compatibility
                    logData[key.ToString()] = (double)value;
                    break;

                default:
                    logData[key.ToString()] = value.ToString();
                    break;
            }
        }

        // Serialize to JSON
        var json = JsonSerializer.Serialize(logData);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await client.PostAsync("http://localhost:5000/api/choices", content);

        if (response.IsSuccessStatusCode)
            GD.Print("Log sent successfully");
        else
            GD.Print($"Failed to log data: {response.StatusCode}");
    }

    private async void OnTimeOut()
    {
        GD.Print("Took too long");

        // Update message label if available
        if (_MessageLabel == null)
            _MessageLabel = GetNodeOrNull<Label>("Text");

        if (_MessageLabel != null)
            _MessageLabel.Text = "Time ran out";

        // Build a small log dictionary and send it
        var log = new Godot.Collections.Dictionary();
        log["event"] = "timeout";
        log["time_taken"] = 0;

        await SendLog(log);
    }
}