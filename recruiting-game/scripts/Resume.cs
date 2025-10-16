using Godot;
using System.Collections.Generic;

public partial class Resume : Control
{
    [Export] public string CandidateName;
    [Export] public string Position;
    [Export] public string Gender;
    [Export] public string Education;
    [Export] public string[] Skills;

    private Label _nameLabel;
    private Label _positionLabel;
    private Label _genderLabel;
    private Label _educationLabel;
    private Label _skillsLabel;
    private Button _chooseButton;

    public override void _Ready()
    {
        _nameLabel = GetNode<Label>("VBoxContainer/Header/NameLabel");
        _positionLabel = GetNode<Label>("VBoxContainer/Header/PositionLabel");
        _genderLabel = GetNode<Label>("VBoxContainer/TabContainer/PersonalTab/Gender");
        _educationLabel = GetNode<Label>("VBoxContainer/TabContainer/EducationTab/EducationValue");
        _skillsLabel = GetNode<Label>("VBoxContainer/TabContainer/SkillsTab/SkillLabel");
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
        _skillsLabel.Text = Skills[0];
    }

    private void OnChooseButtonPressed()
    {
        GD.Print($"Candidate {CandidateName} selected.");
        Hide();
        // EmitSignal("ResumeChosen", CandidateName);
    }
}
