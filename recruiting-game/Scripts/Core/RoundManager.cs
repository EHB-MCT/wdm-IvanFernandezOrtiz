using Godot;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public partial class RoundManager : Node
{
    private PackedScene _resumeScene;
    private Marker2D _positionA;
    private Marker2D _positionB;
    private Node _parentNode;
    private List<Resume> _currentResumes = new List<Resume>();

    public event Action<Godot.Collections.Dictionary> OnResumeChosen;
    public event Action OnTimeout;

    public void Initialize(Node parentNode)
    {
        _parentNode = parentNode;
        _resumeScene = GD.Load<PackedScene>("res://scenes/resume.tscn");
        _positionA = parentNode.GetNode<Marker2D>("Option1");
        _positionB = parentNode.GetNode<Marker2D>("Option2");
    }

    public async Task NewRoundAsync()
    {
        ClearCurrentResumes();

        var candidates = GameManager.CurrentCandidates;
        if (candidates == null || candidates.Length == 0)
        {
            GD.PrintErr("No candidates available for new round!");
            return;
        }

        int resumeCount = Math.Min(2, candidates.Length);
        var usedIndices = new HashSet<int>();
        var random = new Random();
        var roundCandidates = new CandidateData[resumeCount];

        for (int i = 0; i < resumeCount; i++)
        {
            int randomIndex;
            do
            {
                randomIndex = random.Next(candidates.Length);
            } while (usedIndices.Contains(randomIndex));

            usedIndices.Add(randomIndex);
            var candidate = candidates[randomIndex];
            roundCandidates[i] = candidate;

            var resumeInstance = _resumeScene.Instantiate<Resume>();
            _parentNode.AddChild(resumeInstance);
            _currentResumes.Add(resumeInstance);

            PositionResume(resumeInstance, i);
            ConfigureResume(resumeInstance, candidate);
        }

        // GD.Print($"Round {GameManager.CurrentRound} started with {resumeCount} candidates");
        await Task.Delay(1000);
        // GD.Print("Candidates are ready! Make your selection...");
    }

    private void ClearCurrentResumes()
    {
        foreach (var resume in _currentResumes)
        {
            if (resume != null && IsInstanceValid(resume))
            {
                resume.QueueFree();
            }
        }
        _currentResumes.Clear();

        foreach (Node child in _parentNode.GetChildren())
        {
            if (child is Resume)
            {
                child.QueueFree();
            }
        }
    }

    private void PositionResume(Resume resume, int index)
    {
        Marker2D targetMarker = (index == 0) ? _positionA : _positionB;
        if (targetMarker != null)
        {
            resume.Position = targetMarker.Position;
            // GD.Print($"Resume {index + 1} positioned at marker: {targetMarker.Name} at position {targetMarker.Position}");
        }
        else
        {
            resume.Position = new Vector2(index == 0 ? 155 : 672, 155);
        }

        resume.Scale = new Vector2(0.9f, 0.9f);
    }

    private void ConfigureResume(Resume resume, CandidateData candidate)
    {
        resume.SetResumeData(
            candidate.candidate_id,
            candidate.candidateName,
            candidate.position,
            candidate.gender,
            candidate.education,
            candidate.skills,
            candidate.picturePath,
            candidate.workExperience
        );

        resume.ResumeChosen += OnResumeChoiceHandler;
    }

    private void OnResumeChoiceHandler(Godot.Collections.Dictionary data)
    {
        OnResumeChosen?.Invoke(data);
    }

    public void HandleTimeout()
    {
        OnTimeout?.Invoke();
    }

    public void ClearAllResumes()
    {
        ClearCurrentResumes();
    }
}