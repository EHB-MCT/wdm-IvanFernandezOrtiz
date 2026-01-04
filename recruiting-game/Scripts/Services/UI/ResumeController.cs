using Godot;
using Godot.Collections;
using System.Collections.Generic;
using System.Linq;

public partial class ResumeController : Control
{
    [Signal]
    public delegate void ResumeChosenEventHandler(Dictionary data);

    private ResumeView _resumeView;
    private List<string> _viewedTabs = new List<string>();
    private string[] _tabs = { "Profile", "Education", "Skills", "Work" };
    

    // Data properties
    private string _candidateId;
    private string _candidateName;
    private string _candidatePosition;
    private string _gender;
    private string _education;
    private string[] _skills;
    private Texture2D _picturePath;
    private string _workExperience;

    public override void _Ready()
    {
        _resumeView = GetNode<ResumeView>("ResumeView");
        if (_resumeView == null)
        {
            GD.PrintErr("ResumeController: Failed to find ResumeView");
            return;
        }

        // Connect to view signals
        _resumeView.Connect("ChooseButtonPressed", new Callable(this, nameof(OnChooseButtonPressed)));
    }

    public void SetResumeData(string candidateId, string candidateName, string position, string gender,
        string education, string[] skills, string picturePath, string workExperience)
    {
        _candidateId = candidateId ?? "UNKNOWN001";
        _candidateName = candidateName ?? "Unknown Candidate";
        _candidatePosition = position ?? "Unknown Position";
        _gender = gender ?? "Unknown";
        _education = education ?? "Unknown Education";
        _skills = skills ?? new string[0];
        _workExperience = workExperience ?? "No Experience";

        // Load texture safely
        if (!string.IsNullOrEmpty(picturePath))
        {
            _picturePath = GD.Load<Texture2D>(picturePath);
            if (_picturePath == null)
            {
                GD.PrintErr($"Failed to load texture: {picturePath}");
                // Try to load a default texture
                _picturePath = GD.Load<Texture2D>("res://assets/icon.svg");
            }
        }

        // Update view
        _resumeView.RefreshUI(_candidateName, _candidatePosition, _gender, _education, _picturePath, _workExperience);
        _resumeView.DisplaySkills(_skills);
    }

    public void OnTabClicked(int tabIndex)
    {
        if (tabIndex >= 0 && tabIndex < _tabs.Length)
        {
            _viewedTabs.Add(_tabs[tabIndex]);
            GD.Print(string.Join(", ", _viewedTabs));
        }
    }

    

    private void OnChooseButtonPressed()
    {
        var data = new Dictionary {
            {"candidate_id", _candidateId ?? "N/A" },
            {"candidate_gender", _gender ?? "N/A"},
            {"candidate_position", _candidatePosition ?? "N/A"},
            {"candidate_education", _education ?? "N/A"},
            {"candidate_workExperience", _workExperience ?? "N/A"},
            {"candidate_skills", _skills ?? new string[0]},
            {"tabs_viewed", new Array(_viewedTabs.Select(tab => (Variant)tab).ToArray()) },
            {"time_taken", 0.0}
        };

        EmitSignal("ResumeChosen", data);
        Hide();
    }
}