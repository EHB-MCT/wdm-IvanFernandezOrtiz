using Godot;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;
using System;

public partial class Main : Node
{

    private Label _MessageLabel;
    private Timer timer;
    private Label _TimeLeftLabel;

    public void NewGame()
    {
        GetNode<Timer>("StartTimer").Start();
    }

    private static readonly System.Net.Http.HttpClient client = new System.Net.Http.HttpClient();

    public override void _Ready()
    {
        // Cache common nodes if they exist in the scene
        timer = GetNodeOrNull<Timer>("Timer");
        _MessageLabel = GetNode<Label>("Text");
        _TimeLeftLabel = GetNode<Label>("TimeLeft");
    }

    public override void _Process(double delta)
    {
        // Show remaining time if we have a timer and a label
        if (timer != null && _TimeLeftLabel != null)
        {
            // TimeLeft is a double; show as whole seconds remaining
            var left = Math.Ceiling(timer.TimeLeft);
            _TimeLeftLabel.Text = $"Time left: {left}s";
        }
    }

    private async void OnResumeChosen(Godot.Collections.Dictionary data)
    {

            GD.Print("Main received chosen candidate");

        // Ensure we have a timer reference
        if (timer == null)
            timer = GetNode<Timer>("Timer");

        // Add time left to the data being logged (if timer exists)
        if (timer != null)
            data["time_taken"] = timer.TimeLeft;

        await SendLog(data);
    }

    public async Task SendLog(Godot.Collections.Dictionary data)
    {
        // Convert Godot Dictionary → C# Dictionary<string, object>
        var logData = new Dictionary<string, object>();

        foreach (var key in data.Keys)
        {
            GD.Print($"KEY = {key}, VALUE = {data[key]}");

            var value = data[key];
            // logData[key.ToString()] = value.ToString();

            switch (value.VariantType)
            {
                case Variant.Type.String:
                    logData[key.ToString()] = (string)value;
                    break;

                case Variant.Type.Int:
                    logData[key.ToString()] = (int)value;
                    break;

                case Variant.Type.Array:
                    var arr = (Godot.Collections.Array)value;

                    // check if it's an array of strings
                    var stringList = new List<string>();
                    foreach (var item in arr)
                        stringList.Add(item.ToString());

                    logData[key.ToString()] = stringList.ToArray();
                    break;

                case Variant.Type.Float:
                    // store as double for JSON serializer compatibility
                    logData[key.ToString()] = (double)value;
                    break;

                default:
                    logData[key.ToString()] = value.ToString();
                    break;
            }
        }

        // Serialize to JSON
        var json = JsonSerializer.Serialize(logData);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await client.PostAsync("http://localhost:5000/api/log", content);

        if (response.IsSuccessStatusCode)
            GD.Print("Log sent successfully");
        else
            GD.Print($"Failed to log data: {response.StatusCode}");
    }

    private async void OnTimeOut()
    {
        GD.Print("Took too long");

        // Update message label if available
        if (_MessageLabel == null)
            _MessageLabel = GetNodeOrNull<Label>("Text");

        if (_MessageLabel != null)
            _MessageLabel.Text = "Time ran out";

        // Build a small log dictionary and send it
        var log = new Godot.Collections.Dictionary();
        log["event"] = "timeout";
        log["time_taken"] = 0;

        await SendLog(log);
    }
}