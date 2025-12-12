using Godot;
using System.Collections.Generic;
using System.Threading.Tasks;

public partial class Main : Node
{
    private UIManager _uiManager;
    private RoundManager _roundManager;

    public override void _Ready()
    {
        // Initialize managers
        _uiManager = new UIManager();
        _roundManager = new RoundManager();
        
        AddChild(_uiManager);
        AddChild(_roundManager);
        
        _uiManager.Initialize(this);
        _roundManager.Initialize(this);

        // Subscribe to events
        _roundManager.OnResumeChosen += OnResumeChosen;
        _roundManager.OnTimeout += OnTimeout;

        // Load candidates from JSON
        CandidateLoader.LoadCandidates();

        // Test API connectivity
        _ = TestApiConnectionAsync();

        // Start the game
        NewGame();
    }

    private async Task TestApiConnectionAsync()
    {
        await ApiService.TestConnectionAsync();
    }

    private async void NewGame()
    {
        GD.Print("Starting new game...");
        GameManager.Initialize();
        await NewRound();
    }

    public override void _Process(double delta)
    {
        _uiManager.UpdateTimerDisplay();
    }

    private async void OnResumeChosen(Godot.Collections.Dictionary data)
    {
        GD.Print($"Round {GameManager.CurrentRound}: Candidate chosen");

        string chosenCandidateId = data["candidate_id"].ToString();

        // Process candidate selection
        GameManager.SelectCandidate(chosenCandidateId);

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

        // Create and send log data
        var logData = ApiService.CreateLogData(
            chosenCandidateId,
            data["candidate_position"].ToString(),
            _uiManager.GetTimeLeft(),
            tabsViewed,
            GameManager.CurrentRound
        );

        await ApiService.SendLogAsync(logData);

        // Add delay before next round
        GD.Print("Processing your choice...");
        await Task.Delay(1500);

        // Check if round should advance
        CheckRoundProgress();
    }

    private async void CheckRoundProgress()
    {
        if (GameManager.CheckRoundComplete())
        {
            if (GameManager.IsGameComplete())
            {
                await EndGameAsync();
            }
            else
            {
                GameManager.AdvanceRound();
                await NewRound();
            }
        }
        else
        {
            GD.Print($"Round {GameManager.CurrentRound}: Selection made, continuing round...");
        }
    }

    private async void OnTimeout()
    {
        GD.Print("Timeout: took too long");

        _uiManager.ShowTimeoutMessage();

        // Log timeout event
        var logData = ApiService.CreateTimeoutLogData(GameManager.CurrentRound);
        await ApiService.SendLogAsync(logData);

        // Check if round should advance
        CheckRoundProgress();
    }

    private async void OnTimeOut()
    {
        await OnTimeout();
    }

    // This method is now handled by ApiService.CreateTimeoutLogData

    // API logging is now handled by ApiService

    private async Task EndGameAsync()
    {
        GD.Print("=== GAME COMPLETE ===");
        GD.Print($"Total rounds played: {GameManager.MaxRounds}");
        GD.Print("Thank you for playing!");

        _roundManager.ClearAllResumes();
        _uiManager.StopTimer();
        _uiManager.ShowGameCompleteMessage();

        GameManager.ResetGame();

        // Optionally wait before starting a new game
        await Task.Delay(3000);
        
        // Start new game automatically or wait for user input
        GD.Print("Starting new game...");
        NewGame();
    }

    public async Task NewRound()
    {
        GD.Print($"Starting round {GameManager.CurrentRound}");
        
        // Prepare candidates for this round
        GameManager.PrepareRoundCandidates();
        
        // Start the timer
        _uiManager.StartTimer();
        
        // Create and display resumes
        await _roundManager.NewRoundAsync();
    }
}