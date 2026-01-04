using Godot;
using Godot.Collections;
using System.Collections.Generic;

public partial class ResumeView : Control
{
    private Label _nameLabel;
    private Label _positionLabel;
    private Label _genderLabel;
    private Label _educationLabel;
    private Label _skillsLabel;
    private Label _workLabel;
    private VBoxContainer _skillsTab;
    private TextureRect _textureRect;
    private Button _chooseButton;

    private const string Unknown = "N/A";

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
            GD.PrintErr("ResumeView: Failed to find required nodes in scene tree");
            return;
        }

        // Connect button signal
        _chooseButton.Pressed += OnChooseButtonPressed;
    }

    public void RefreshUI(string candidateName, string candidatePosition, string gender, 
        string education, Texture2D picturePath, string workExperience)
    {
        if (_nameLabel != null && candidateName != null)
            _nameLabel.Text = candidateName;

        if (_positionLabel != null && candidatePosition != null)
            _positionLabel.Text = candidatePosition;

        if (_genderLabel != null && gender != null)
            _genderLabel.Text = gender;

        if (_educationLabel != null && education != null)
            _educationLabel.Text = education;

        if (_textureRect != null && picturePath != null)
            _textureRect.SetTexture(picturePath);

        if (_workLabel != null && workExperience != null)
            _workLabel.Text = workExperience;
    }

    public void DisplaySkills(string[] skills)
    {
        if (_skillsTab == null) return;

        // Clear existing skill labels
        foreach (Node child in _skillsTab.GetChildren())
        {
            child.QueueFree();
        }

        // Add skill labels
        if (skills != null)
        {
            for (int i = 0; i < skills.Length; i++)
            {
                var skillLabel = new Label();
                skillLabel.Text = skills[i];
                _skillsTab.AddChild(skillLabel);
            }
        }
    }

    private void OnChooseButtonPressed()
    {
        // Event will be handled by ResumeController
        EmitSignal("ChooseButtonPressed");
    }
}