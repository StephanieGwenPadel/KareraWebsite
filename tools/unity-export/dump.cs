var ci = System.Globalization.CultureInfo.InvariantCulture;
System.Func<string,string> Q = s => "\"" + (s ?? "").Replace("\\","\\\\").Replace("\"","\\\"").Replace("\n","\n").Replace("\r","") + "\"";
System.Func<float,string> F = f => f.ToString("0.###", ci);
var roster = UnityEditor.AssetDatabase.LoadAssetAtPath<Karera.Data.VehicleRoster>("Assets/Data/Roster_Karera.asset");
var sb = new System.Text.StringBuilder();
sb.Append("{\"vehicles\":[");
for (int i = 0; i < roster.Count; i++) {
  var d = roster[i];
  if (i > 0) sb.Append(",");
  string drive = d.UsesManualGearbox ? "ManualGearbox" : d.UsesWhipDrive ? "WhipDrive" : d.UsesPedalDrive ? "PedalDrive" : d.UsesElectricDrive ? "ElectricDrive" : "Arcade";
  sb.Append("{\"id\":" + Q(d.name) + ",\"name\":" + Q(d.FilipinoName) + ",\"english\":" + Q(d.EnglishName) + ",\"class\":" + Q(d.Class.ToString()) + ",\"era\":" + Q(d.Era.ToString()));
  sb.Append(",\"flavour\":" + Q(d.FlavourText) + ",\"mass\":" + F(d.Mass) + ",\"topSpeed\":" + F(d.TopSpeed) + ",\"accel\":" + F(d.Acceleration) + ",\"brake\":" + F(d.BrakeForce));
  sb.Append(",\"grip\":" + F(d.BaseGrip) + ",\"steerRate\":" + F(d.SteerRateDegPerSec) + ",\"wheelRadius\":" + F(d.WheelRadius) + ",\"drive\":" + Q(drive) + ",\"steering\":" + Q(d.SteeringControl.ToString()) + ",\"hud\":" + Q(d.HudStyle.ToString()) + ",\"ring\":" + Q(d.SecondaryRing.ToString()));
  if (d.UsesManualGearbox) sb.Append(",\"gears\":" + d.Gearbox.GearCount + ",\"reverse\":" + (d.Gearbox.HasReverseGear ? "true":"false") + ",\"redline\":" + F(d.Gearbox.RedlineRpm) + ",\"engineBraking\":" + F(d.Gearbox.EngineBraking) + ",\"finalDrive\":" + F(d.Gearbox.FinalDrive));
  sb.Append(",\"prefab\":" + Q(UnityEditor.AssetDatabase.GetAssetPath(d.Prefab)));
  sb.Append(",\"skins\":[");
  for (int s = 0; s < d.SkinCount; s++) { var k = d.SkinAt(s); if (s>0) sb.Append(",");
    sb.Append("{\"id\":" + Q(k.Id) + ",\"name\":" + Q(k.DisplayName) + ",\"tier\":" + Q(k.Tier.ToString()) + ",\"desc\":" + Q(k.Description) + ",\"tagline\":" + Q(k.Tagline) + ",\"swatch\":\"#" + UnityEngine.ColorUtility.ToHtmlStringRGB(k.Swatch) + "\",\"prefab\":" + Q(k.Prefab ? UnityEditor.AssetDatabase.GetAssetPath(k.Prefab) : "") + ",\"recolors\":[");
    for (int r = 0; r < k.RecolorCount; r++) { var rc = k.RecolorAt(r); if (r>0) sb.Append(","); sb.Append("{\"material\":" + Q(rc.material) + ",\"colour\":\"#" + UnityEngine.ColorUtility.ToHtmlStringRGB(rc.colour) + "\",\"metallic\":" + F(rc.metallic) + ",\"smoothness\":" + F(rc.smoothness) + "}"); }
    sb.Append("]}"); }
  sb.Append("]}");
}
sb.Append("],\"maps\":[");
var cat = UnityEditor.AssetDatabase.LoadAssetAtPath<Karera.Data.MapCatalog>("Assets/Data/Maps_Karera.asset");
for (int m = 0; m < cat.Count; m++) {
  var t = cat.TrackOf(m); if (m > 0) sb.Append(",");
  sb.Append("{\"scene\":" + Q(cat.SceneNameOf(m)) + ",\"name\":" + Q(t.DisplayName) + ",\"flavour\":" + Q(t.FlavourText) + ",\"lap\":" + F(t.LapLength) + ",\"width\":" + F(t.RoadWidth) + ",\"laps\":" + t.DefaultLaps + ",\"finish\":" + t.FinishLineIndex + ",\"pts\":[");
  for (int p = 0; p < t.Count; p++) { var c = t.Centre(p); if (p>0) sb.Append(","); sb.Append("[" + F(c.x) + "," + F(c.y) + "," + F(c.z) + "]"); }
  sb.Append("]}");
}
sb.Append("]}");
System.IO.File.WriteAllText("Temp/web/karera-data.json", sb.ToString());
return "ok " + sb.Length;
