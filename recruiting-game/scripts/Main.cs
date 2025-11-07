using Godot;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

public partial class Main : Node
{
    private static readonly System.Net.Http.HttpClient client = new System.Net.Http.HttpClient();

    public override void _Ready()
    {
        // Assuming Resume is a child of Main
        var resume = GetNode<Resume>("Resume");
        resume.ResumeChosen += OnResumeChosen;
    }

    private async void OnResumeChosen(string candidateName)
    {
        GD.Print($"Main received chosen candidate: {candidateName}");
        await SendLog(candidateName);
    }

    public async Task SendLog(string candidateId)
    {
        var json = $"{{\"candidate_id\":\"{candidateId}\"}}";
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await client.PostAsync("http://localhost:5000/api/log", content);
        if (response.IsSuccessStatusCode)
            GD.Print("Log sent successfully");
        else
            GD.Print($"Failed to log data: {response.StatusCode}");
    }
}