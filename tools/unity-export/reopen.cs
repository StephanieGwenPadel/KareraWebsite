var p = UnityEngine.SceneManagement.SceneManager.GetActiveScene().path;
UnityEditor.SceneManagement.EditorSceneManager.OpenScene("Assets/Scenes/Map04_Bustos.unity");
return p + " -> reopened Map04_Bustos clean";
