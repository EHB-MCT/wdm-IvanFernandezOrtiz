using Godot;
using Godot.Collections;
using System;
using System.Collections.Generic;

public partial class Resume : Control
{

    [Signal]
    public delegate void ResumeChosenEventHandler(string candidateName);

    [Export] public string CandidateName;
    [Export] public string Position;
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
        _nameLabel = GetNode<Label>("VBoxContainer/Header/NameLabel");
        _positionLabel = GetNode<Label>("VBoxContainer/Header/PositionLabel");
        _genderLabel = GetNode<Label>("VBoxContainer/TabContainer/Profile/Gender");
        _educationLabel = GetNode<Label>("VBoxContainer/TabContainer/Education/EducationValue");
        _workLabel = GetNode<Label>("VBoxContainer/TabContainer/Work/WorkValue");
        _skillsTab = GetNode<VBoxContainer>("VBoxContainer/TabContainer/Skills");
        _textureRect = GetNode<TextureRect>("VBoxContainer/TabContainer/Profile/TextureRect");


        for (int i = 0; i < Skills.Length; i++)
        {
            var skillLabel = new Label();
            skillLabel.Text = Skills[i];
            _skillsTab.AddChild(skillLabel);
            // GD.Print(_skillsTab.GetChildren());
        }

        _chooseButton = GetNode<Button>("ChooseButton");

        _chooseButton.Pressed += OnChooseButtonPressed;

        RefreshUI();
    }

    private void RefreshUI()
    {
        _nameLabel.Text = CandidateName;
        _positionLabel.Text = Position;
        _genderLabel.Text = Gender;
        _educationLabel.Text = Education;
        _textureRect.SetTexture(PicturePath);
        _workLabel.Text = WorkExperience;

        int skillIndex = 0;
        foreach (Label _label_i in _skillsTab.GetChildren())
        {
            _label_i.Text = Skills[skillIndex];
            skillIndex++;
        }

    }

    private void OnChooseButtonPressed()
    {
        // GD.Print($"Candidate {CandidateName} selected.");
        var data = new Dictionary {
        {"candidate_id", CandidateName },
        {"candidate_gender", Gender},
        {"candidate_position", Position},
        {"candidate_education", Education},
        {"candidate_workExperience", WorkExperience},
        {"candidate_skills", Skills},
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
}
