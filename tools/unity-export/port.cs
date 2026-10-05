string outDir = "E:/Desktop/Karera Website/public/cast"; System.IO.Directory.CreateDirectory(outDir);
var sb = new System.Text.StringBuilder("[");
System.Func<string,string> Q = s => "\"" + (s ?? "").Replace("\\","\\\\").Replace("\"","\\\"").Replace("\n"," ") + "\"";
bool first = true;
foreach (var id in new[]{"player","emman","cora","isko","nonoy","diego","ruben","serina"}) {
  var c = UnityEditor.AssetDatabase.LoadAssetAtPath<Karera.Race.CharacterDefinition>("Assets/Data/Story/Characters/Character_" + id + ".asset");
  var sp = Karera.UI.CharacterPortraitFactory.Portrait(c, Karera.Race.Emotion.Determined, 384);
  System.IO.File.WriteAllBytes(outDir + "/" + id + ".png", UnityEngine.ImageConversion.EncodeToPNG(sp.texture));
  if (!first) sb.Append(","); first = false;
  sb.Append("{\"id\":" + Q(id) + ",\"name\":" + Q(c.DisplayName) + ",\"role\":" + Q(c.Role) + ",\"bio\":" + Q(c.Bio) + ",\"age\":" + c.Age + "}");
}
sb.Append("]"); System.IO.File.WriteAllText("Temp/web/cast.json", sb.ToString());
return sb.ToString();
