using Godot;
using System;

public partial class UIManager : Node
{
    private Label _MessageLabel;
    private Label _TimeLeftLabel;
    private Timer _timer;

    public void Initialize(Node parentNode)
    {
        _MessageLabel = parentNode.GetNode<Label>("MessageLabel");
        _TimeLeftLabel = parentNode.GetNode<Label>("TimeLeft");
        _timer = parentNode.GetNode<Timer>("Timer");
        
        GD.Print($"UIManager initialized - MessageLabel: {_MessageLabel != null}, TimeLeftLabel: {_TimeLeftLabel != null}, Timer: {_timer != null}");
    }

    public void UpdateTimerDisplay()
    {
        if (_timer != null && _TimeLeftLabel != null && _timer.TimeLeft > 0)
        {
            var left = Math.Ceiling(_timer.TimeLeft);
            _TimeLeftLabel.Text = $"Time left: {left}s";
        }
    }

    public void SetMessage(string message)
    {
        if (_MessageLabel != null)
        {
            _MessageLabel.Text = message;
            GD.Print($"UI Message set: {message}");
        }
        else
        {
            GD.PrintErr("MessageLabel is null - cannot set message");
        }
    }

    public void ShowTimeoutMessage()
    {
        SetMessage("Time ran out");
        GD.Print("UI Message set to: Time ran out");
    }

    public void ShowGameCompleteMessage()
    {
        SetMessage("Game Complete! Thank you for playing!");
    }

    public void StartTimer()
    {
        if (_timer != null)
        {
            _timer.Start();
        }
    }

    public void StopTimer()
    {
        if (_timer != null)
        {
            _timer.Stop();
        }
    }

    public double GetTimeLeft()
    {
        return _timer != null ? _timer.TimeLeft : 0;
    }
}