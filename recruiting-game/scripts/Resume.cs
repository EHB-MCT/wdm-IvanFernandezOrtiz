using Godot;
using Godot.Collections;
using System.Collections.Generic;

public partial class Resume : Control
{

    [Signal]
    public delegate void ResumeChosenEventHandler(Godot.Collections.Dictionary data);

    [Export] public string CandidateName;
    [Export] public string CandidatePosition;
    [Export] public string Gender;
    [Export] public string Education;
    [Export] public string[] Skills;
    [Export] public Texture2D PicturePath;
    [Export] public string WorkExperience;

    private Label _nameLabel;
    private Label _positionLabel;
    private Label _genderLabel;
    private Label _educationLabel;
    private Label _skillsLabel;
    private Label _workLabel;
    private VBoxContainer _skillsTab;
    private TextureRect _textureRect;
    private Button _chooseButton;
    private List<string> viewedTabs = new List<string>();
    private string[] tabs = { "Profile", "Education", "Skills", "Work" };

    private float timeTaken;

    public override void _Ready()
    {
        // Get all required nodes with null checks
        _nameLabel = GetNode<Label>("VBoxContainer/Header/NameLabel");
        _positionLabel = GetNode<Label>("VBoxContainer/Header/PositionLabel");
        _genderLabel = GetNode<Label>("VBoxContainer/TabContainer/Profile/Gender");
        _educationLabel = GetNode<Label>("VBoxContainer/TabContainer/Education/EducationValue");
        _workLabel = GetNode<Label>("VBoxContainer/TabContainer/Work/WorkValue");
        _skillsTab = GetNode<VBoxContainer>("VBoxContainer/TabContainer/Skills");
        _textureRect = GetNode<TextureRect>("VBoxContainer/TabContainer/Profile/TextureRect");
        _chooseButton = GetNode<Button>("ChooseButton");

        // Validate all nodes were found
        if (_nameLabel == null || _positionLabel == null || _genderLabel == null ||
            _educationLabel == null || _workLabel == null || _skillsTab == null ||
            _textureRect == null || _chooseButton == null)
        {
            GD.PrintErr("Resume: Failed to find required nodes in scene tree");
            return;
        }

        // Connect button signal
        _chooseButton.Pressed += OnChooseButtonPressed;

        // Initialize skills display if Skills array is available
        GD.Print($"Resume._Ready: Skills array length = {Skills?.Length ?? 0}");
        GD.Print($"Resume._Ready: Skills content = {(Skills != null ? string.Join(", ", Skills) : "null")}");
        GD.Print(Skills);
        GD.Print(_skillsTab);
        if (Skills != null && _skillsTab != null)
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
                GD.Print($"Resume._Ready: Added skill label: {Skills[i]}");
            }
        }
        else
        {
            GD.PrintErr("Resume._Ready: Skills is null or _skillsTab is null");
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

        if (_educationLabel != null && Education != null)
            _educationLabel.Text = Education;

        if (_textureRect != null && PicturePath != null)
            _textureRect.SetTexture(PicturePath);

        if (_workLabel != null && WorkExperience != null)
            _workLabel.Text = WorkExperience;

        // Update skills display
        if (_skillsTab != null && Skills != null)
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
                GD.Print($"RefreshUI: Added skill label: {Skills[i]}");
            }
        }
    }

    private void OnChooseButtonPressed()
    {
        // GD.Print($"Candidate {CandidateName} selected.");
        var data = new Dictionary {
        {"candidate_id", CandidateName ?? "Unknown" },
        {"candidate_gender", Gender ?? "Unknown"},
        {"candidate_position", CandidatePosition ?? "Unknown"},
        {"candidate_education", Education ?? "Unknown"},
        {"candidate_workExperience", WorkExperience ?? "Unknown"},
        {"candidate_skills", Skills ?? new string[0]},
        {"tabs_viewed", new Array<string>(viewedTabs) },
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
    /// Set resume data after instantiation (for dynamic loading).
    /// </summary>
    public void SetResumeData(string candidateName, string position, string gender,
        string education, string[] skills, string picturePath, string workExperience)
    {
        GD.Print($"SetResumeData called with skills: {(skills != null ? string.Join(", ", skills) : "null")}");

        CandidateName = candidateName ?? "Unknown Candidate";
        CandidatePosition = position ?? "Unknown Position";
        Gender = gender ?? "Unknown";
        Education = education ?? "Unknown Education";

        // Set skills array
        Skills = skills ?? new string[0];

        GD.Print($"SetResumeData: Skills set to: {string.Join(", ", Skills)}");

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
            GD.Print("Resume: Refreshed UI with new data");
        }
        else
        {
            GD.Print("Resume: UI nodes not ready yet, data will be displayed when _Ready() completes");
        }
    }
}
