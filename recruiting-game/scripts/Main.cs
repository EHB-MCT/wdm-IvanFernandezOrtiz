using Godot;
using System.Collections.Generic;
using System.Threading.Tasks;

public partial class Main : Node
{
    private UIManager _uiManager;
    private RoundManager _roundManager;

    public override async void _Ready()
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

        // Connect to timer timeout signal
        var timer = GetNode<Timer>("Timer");
        timer.Timeout += OnTimeout;

        // Load candidates from API and test connection
        await InitializeGameAsync();
    }

    private async Task TestApiConnectionAsync()
    {
        await ApiService.TestConnectionAsync();
    }

    private async Task InitializeGameAsync()
    {
        // Test API connectivity
        var isConnected = await ApiService.TestConnectionAsync();
        
        if (isConnected)
        {
            GD.Print("API connected successfully. Loading candidates from database...");
        }
        else
        {
            GD.Print("API connection failed. Using local fallback candidates.");
        }
        
        // Load candidates from API (with local fallback)
        await CandidateLoader.LoadCandidatesAsync();
        
        // Start the game
        NewGame();
    }

    private async void NewGame()
    {
        GD.Print("Starting new game...");
        GameManager.Initialize();
        await GameManager.LoadCandidatesAsync();
        await NewRound();
    }

    public override void _Process(double delta)
    {
        _uiManager.UpdateTimerDisplay();
    }

    private async void OnResumeChosen(Godot.Collections.Dictionary data)
    {
        string chosenCandidateId = data["candidate_id"].ToString();
        string candidateName = data.ContainsKey("candidate_name") ? data["candidate_name"].ToString() : "Candidate";

        // GD.Print($"Round {GameManager.CurrentRound}: {candidateName} chosen");
        _uiManager.SetMessage($"{candidateName} chosen! Processing choice...");

        // Freeze the timer while processing the choice
        _uiManager.FreezeTimer();

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

        // GD.Print("Processing your choice...");
        await Task.Delay(1500);

        // Unfreeze timer and clear message after processing
        _uiManager.UnfreezeTimer();
        _uiManager.SetMessage("");

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
            // GD.Print($"Round {GameManager.CurrentRound}: Selection made, continuing round...");
        }
    }

    private async void OnTimeout()
    {
        // GD.Print("Timeout: took too long");

        _uiManager.ShowTimeoutMessage();
        _uiManager.FreezeTimer();
        await Task.Delay(3000);
        _uiManager.SetMessage("");
        _uiManager.UnfreezeTimer();

        // Log timeout event
        var logData = ApiService.CreateTimeoutLogData(GameManager.CurrentRound);
        await ApiService.SendLogAsync(logData);

        // Check if round should advance
        CheckRoundProgress();
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
        // GD.Print("Starting new game...");
        NewGame();
    }

    public async Task NewRound()
    {
        // GD.Print($"Starting round {GameManager.CurrentRound}");

        // Prepare candidates for this round
        GameManager.PrepareRoundCandidates();

        // Start the timer
        _uiManager.StartTimer();

        // Create and display resumes
        await _roundManager.NewRoundAsync();
    }
}