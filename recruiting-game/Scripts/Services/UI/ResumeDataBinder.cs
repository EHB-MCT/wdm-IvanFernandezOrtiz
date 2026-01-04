using Godot;

public static class ResumeDataBinder
{
    /// <summary>
    /// Safely loads a texture from the given path with fallback
    /// </summary>
    public static Texture2D LoadTextureSafely(string picturePath, string fallbackPath = "res://assets/icon.svg")
    {
        if (!string.IsNullOrEmpty(picturePath))
        {
            var texture = GD.Load<Texture2D>(picturePath);
            if (texture != null)
            {
                return texture;
            }
            
            GD.PrintErr($"Failed to load texture: {picturePath}, trying fallback");
        }

        return GD.Load<Texture2D>(fallbackPath) ?? GD.Load<Texture2D>("res://assets/icon2.svg");
    }

    /// <summary>
    /// Validates and provides default values for candidate data
    /// </summary>
    public static (string id, string name, string position, string gender, string education, 
        string workExperience) ValidateCandidateData(string candidateId, string candidateName, 
        string position, string gender, string education, string workExperience)
    {
        return (
            id: !string.IsNullOrEmpty(candidateId) ? candidateId : "UNKNOWN001",
            name: !string.IsNullOrEmpty(candidateName) ? candidateName : "Unknown Candidate",
            position: !string.IsNullOrEmpty(position) ? position : "Unknown Position",
            gender: !string.IsNullOrEmpty(gender) ? gender : "Unknown",
            education: !string.IsNullOrEmpty(education) ? education : "Unknown Education",
            workExperience: !string.IsNullOrEmpty(workExperience) ? workExperience : "No Experience"
        );
    }

    /// <summary>
    /// Safely handles null arrays for skills
    /// </summary>
    public static string[] ValidateSkillsArray(string[] skills)
    {
        return skills ?? new string[0];
    }

    /// <summary>
    /// Converts tab view list to array for serialization
    /// </summary>
    public static Godot.Collections.Array ConvertTabsToArray(System.Collections.Generic.List<string> viewedTabs)
    {
        return new Godot.Collections.Array(viewedTabs.ConvertAll(tab => (Godot.Variant)tab).ToArray());
    }
}