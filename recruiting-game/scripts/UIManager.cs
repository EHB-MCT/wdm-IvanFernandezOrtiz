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
        
        GD.Print($"UIManager initialized - MessageLabel: {(_MessageLabel != null ? "found" : "not found")}, TimeLeft: {(_TimeLeftLabel != null ? "found" : "not found")}, Timer: {(_timer != null ? "found" : "not found")}");
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
        GD.Print($"UIManager: Setting message to '{message}'");
        if (_MessageLabel != null)
        {
            _MessageLabel.Text = message;
            GD.Print($"UIManager: MessageLabel updated successfully");
        }
        else
        {
            GD.Print("UIManager: MessageLabel is null - node not found!");
        }
    }

    public void ShowTimeoutMessage()
    {
        SetMessage("Time ran out");
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