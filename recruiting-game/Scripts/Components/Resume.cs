using Godot;
using Godot.Collections;
using System.Collections.Generic;
using System.Linq;

public partial class Resume : Control
{

    [Signal]
    public delegate void ResumeChosenEventHandler(Godot.Collections.Dictionary data);

    [Export] public string CandidateId;
    [Export] public string CandidateName;
    [Export] public string CandidatePosition;
    [Export] public string Gender;
    [Export] public int Age;
    [Export] public string Race;
    [Export] public string Education;
    [Export] public string[] Skills;
    [Export] public Texture2D PicturePath;
    [Export] public string WorkExperience;

    private Label _nameLabel;
    private Label _positionLabel;
    private Label _genderLabel;
    private Label _ageLabel;
    private Label _raceLabel;
    private Label _educationLabel;
    private Label _skillsLabel;
    private Label _workLabel;
        private VBoxContainer _skillsTab;
        private VBoxContainer _workTab;
        private TextureRect _textureRect;
        private Button _chooseButton;
    private List<string> viewedTabs = new List<string>();
    private string[] tabs = { "Profile", "Education", "Skills", "Work" };

    const string Unknown = "N/A";

    private float timeTaken;

    public override void _Ready()
    {
        // Get all required nodes with null checks
        _nameLabel = GetNode<Label>("VBoxContainer/Header/NameLabel");
        _positionLabel = GetNode<Label>("VBoxContainer/Header/PositionLabel");
        _genderLabel = GetNode<Label>("VBoxContainer/TabContainer/Profile/Gender/GenderValue");
        _ageLabel = GetNode<Label>("VBoxContainer/TabContainer/Profile/Age/AgeValue");
        _raceLabel = GetNode<Label>("VBoxContainer/TabContainer/Profile/Origin/OriginValue");
        _educationLabel = GetNode<Label>("VBoxContainer/TabContainer/Education/EducationValue");
        _workLabel = GetNode<Label>("VBoxContainer/TabContainer/Work/WorkValue");
        _skillsTab = GetNode<VBoxContainer>("VBoxContainer/TabContainer/Skills");
        _workTab = GetNode<VBoxContainer>("VBoxContainer/TabContainer/Work");
        _textureRect = GetNode<TextureRect>("VBoxContainer/TabContainer/Profile/TextureRect");
        _chooseButton = GetNode<Button>("ChooseButton");

        // Validate all nodes were found
        if (_nameLabel == null || _positionLabel == null || _genderLabel == null ||
            _ageLabel == null || _raceLabel == null || _educationLabel == null || _workLabel == null || _skillsTab == null || _workTab == null ||
            _textureRect == null || _chooseButton == null)
        {
            GD.PrintErr("Resume: Failed to find required nodes in scene tree");
            return;
        }

        // Connect button signal
        _chooseButton.Pressed += OnChooseButtonPressed;

        // Initialize skills display if Skills array is available
        // GD.Print($"Resume._Ready: Skills array length = {Skills?.Length ?? 0}");
        // GD.Print($"Resume._Ready: Skills content = {(Skills != null ? string.Join(", ", Skills) : "null")}");
        // GD.Print($"Resume._Ready: _skillsTab is null: {_skillsTab == null}");

        if (Skills != null && _skillsTab != null && Skills.Length > 0)
        {
            // Clear existing skill labels
            foreach (Node child in _skillsTab.GetChildren())
            {
                child.QueueFree();
            }

            // Add skill labels
            for (int i = 0; i < Skills.Length; i++)
            {
                var skillLabel = new Label();
                skillLabel.Text = Skills[i];
                _skillsTab.AddChild(skillLabel);
                // GD.Print($"Resume._Ready: Added skill label: {Skills[i]}");
            }
        }
        else
        {
            if (Skills == null)
                GD.Print("Resume._Ready: Skills is null - will be populated by SetResumeData");
            if (_skillsTab == null)
                GD.PrintErr("Resume._Ready: _skillsTab is null - node path issue");
            if (Skills != null && Skills.Length == 0)
                GD.Print("Resume._Ready: Skills array is empty");
        }

        // Refresh UI with current data
        RefreshUI();
    }

    private void RefreshUI()
    {
        if (_nameLabel != null && CandidateName != null)
            _nameLabel.Text = CandidateName;

        if (_positionLabel != null && CandidatePosition != null)
            _positionLabel.Text = CandidatePosition;

        if (_genderLabel != null && Gender != null)
            _genderLabel.Text = Gender;

        if (_ageLabel != null && Age > 0)
            _ageLabel.Text = Age.ToString();

        if (_raceLabel != null && Race != null)
            _raceLabel.Text = Race;

        if (_educationLabel != null && Education != null)
            _educationLabel.Text = Education;

        if (_textureRect != null && PicturePath != null)
            _textureRect.SetTexture(PicturePath);

        if (_workLabel != null && WorkExperience != null)
            _workLabel.Text = WorkExperience;

        // Update skills display
        EnsureSkillsDisplayed();
        
        // Update work experience display
        EnsureWorkExperienceDisplayed();
    }

    private void OnChooseButtonPressed()
    {
        var data = new Dictionary {
        {"candidate_id", CandidateId ?? Unknown },
        {"candidate_gender", Gender ?? Unknown},
        {"candidate_position", CandidatePosition ?? Unknown},
        {"candidate_education", Education ?? Unknown},
        {"candidate_workExperience", WorkExperience ?? Unknown},
        {"candidate_skills", Skills ?? new string[0]},
        {"tabs_viewed", new Array(viewedTabs.Select(tab => (Variant)tab).ToArray()) },
        {"time_taken", timeTaken}
    };

        EmitSignal("ResumeChosen", data);
        Hide();
    }

    private void OnTabClicked(int tabIndex)
    {
        viewedTabs.Add(tabs[tabIndex]);
        GD.Print(viewedTabs);
    }

    /// <summary>
    /// Ensure skills are properly displayed in the UI
    /// </summary>
    private void EnsureSkillsDisplayed()
    {
        if (_skillsTab != null && Skills != null && Skills.Length > 0)
        {
            // Clear existing skill labels
            foreach (Node child in _skillsTab.GetChildren())
            {
                child.QueueFree();
            }

            // Add new skill labels
            for (int i = 0; i < Skills.Length; i++)
            {
                var skillLabel = new Label();
                skillLabel.Text = Skills[i];
                _skillsTab.AddChild(skillLabel);
                // GD.Print($"EnsureSkillsDisplayed: Added skill label: {Skills[i]}");
            }
        }
        else
        {
            GD.Print($"EnsureSkillsDisplayed: Skipped - _skillsTab null: {_skillsTab == null}, Skills null: {Skills == null}, Skills empty: {(Skills != null && Skills.Length == 0)}");
        }
    }

    /// <summary>
    /// Set resume data after instantiation (for dynamic loading).
    /// </summary>
    public void SetResumeData(string candidateId, string candidateName, string position, string gender,
        int age, string race, string education, string[] skills, string picturePath, string workExperience)
    {
        // GD.Print($"SetResumeData called with skills: {(skills != null ? string.Join(", ", skills) : "null")}");

        CandidateId = candidateId ?? "UNKNOWN001";
        CandidateName = candidateName ?? "Unknown Candidate";
        CandidatePosition = position ?? "Unknown Position";
        Gender = gender ?? "Unknown";
        Age = age > 0 ? age : 25;
        Race = race ?? "Unknown";
        Education = education ?? "Unknown Education";

        // Set skills array
        Skills = skills ?? new string[0];

        // GD.Print($"SetResumeData: Skills set to: {string.Join(", ", Skills)}");

        WorkExperience = workExperience ?? "No Experience";

        // Load texture safely
        if (!string.IsNullOrEmpty(picturePath))
        {
            PicturePath = GD.Load<Texture2D>(picturePath);
            if (PicturePath == null)
            {
                GD.PrintErr($"Failed to load texture: {picturePath}");
                // Try to load a default texture
                PicturePath = GD.Load<Texture2D>("res://assets/icon.svg");
            }
        }

        // Refresh UI to display the new data
        if (_nameLabel != null)
        {
            RefreshUI();
            // GD.Print("Resume: Refreshed UI with new data");
        }
        else
        {
            GD.Print("Resume: UI nodes not ready yet, data will be displayed when _Ready() completes");
        }

        // Ensure skills are displayed regardless of timing
        EnsureSkillsDisplayed();
        EnsureWorkExperienceDisplayed();
    }

    /// <summary>
    /// Parse work experience string into individual job entries
    /// </summary>
    private void ParseAndDisplayWorkExperience()
    {
        if (string.IsNullOrEmpty(WorkExperience))
            return;

        // Parse format: "X years at Company as Title, Y years at Company as Title"
        var workEntries = new List<string>();
        var parts = WorkExperience.Split(new[] { ", " }, System.StringSplitOptions.RemoveEmptyEntries);
        
        foreach (var part in parts)
        {
            if (part.Contains("years at"))
            {
                // Clean up the text and add to work entries
                var cleanedPart = part.Trim();
                if (cleanedPart.StartsWith("and "))
                    cleanedPart = "  " + cleanedPart.Substring(4);
                workEntries.Add(cleanedPart);
            }
        }

        // Clear existing work experience labels
        foreach (Node child in _workTab.GetChildren())
        {
            if (child is Label && child.Name != "Work")
                child.QueueFree();
        }

        // Add new labels for each work experience
        foreach (var entry in workEntries)
        {
            var workLabel = new Label();
            workLabel.Text = entry.Trim();
            workLabel.AutowrapMode = TextServer.AutowrapMode.WordSmart;
            _workTab.AddChild(workLabel);
        }
    }

    /// <summary>
    /// Ensure work experience is properly displayed in UI
    /// </summary>
    private void EnsureWorkExperienceDisplayed()
    {
        if (_workTab != null && !string.IsNullOrEmpty(WorkExperience))
        {
            ParseAndDisplayWorkExperience();
        }
    }
}
