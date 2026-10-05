// Transparent studio renders of every vehicle (and skins) for the website.
string outDir = "E:/Desktop/Karera Website/public/vehicles"; System.IO.Directory.CreateDirectory(outDir);
var jobs = new string[][] {
  new[]{"Tricycle/Tricycle","traysikel"}, new[]{"Kalesa/Kalesa","kalesa"}, new[]{"Padyak/Padyak","padyak"},
  new[]{"Jeepney/Jeepney","jeepney"}, new[]{"HabalHabal/HabalHabal","habalhabal"}, new[]{"HabalHabal/HabalHabal_ThreeUp","habalhabal-threeup"},
  new[]{"Keso/Keso","keso"}, new[]{"Motorela/Motorela","motorela"} };
bool fog = UnityEngine.RenderSettings.fog; UnityEngine.RenderSettings.fog = false;
var others = new System.Collections.Generic.List<UnityEngine.Camera>();
foreach (var o in UnityEngine.Object.FindObjectsByType<UnityEngine.Camera>(UnityEngine.FindObjectsSortMode.None)) if (o.enabled) { o.enabled = false; others.Add(o); }
var camGo = new UnityEngine.GameObject("StudioCam"); var cam = camGo.AddComponent<UnityEngine.Camera>();
var data = camGo.AddComponent<UnityEngine.Rendering.Universal.UniversalAdditionalCameraData>();
data.renderPostProcessing = false; data.renderShadows = false;
cam.allowHDR = false; cam.allowMSAA = true; cam.clearFlags = UnityEngine.CameraClearFlags.SolidColor; cam.backgroundColor = new UnityEngine.Color(0, 0, 0, 0);
cam.nearClipPlane = 0.05f; cam.farClipPlane = 60f;
var origin = new UnityEngine.Vector3(0, 900, 0);
var sceneLights = new System.Collections.Generic.List<UnityEngine.Light>();
foreach (var l in UnityEngine.Object.FindObjectsByType<UnityEngine.Light>(UnityEngine.FindObjectsSortMode.None)) if (l.enabled) { l.enabled = false; sceneLights.Add(l); }
var keyGo = new UnityEngine.GameObject("StudioKey"); var key = keyGo.AddComponent<UnityEngine.Light>(); key.type = UnityEngine.LightType.Directional; key.intensity = 1.6f; key.color = new UnityEngine.Color(1f, 0.96f, 0.9f); key.shadows = UnityEngine.LightShadows.None;
UnityEngine.RenderSettings.sun = key;
var sb = new System.Text.StringBuilder();
System.Action<string, int, int> shoot = (file, w, h) => {
  var rt = new UnityEngine.RenderTexture(w, h, 24, UnityEngine.RenderTextureFormat.ARGB32); rt.antiAliasing = 8;
  cam.targetTexture = rt; cam.aspect = (float)w / h; cam.Render();
  var prev = UnityEngine.RenderTexture.active; UnityEngine.RenderTexture.active = rt;
  var tex = new UnityEngine.Texture2D(w, h, UnityEngine.TextureFormat.RGBA32, false);
  tex.ReadPixels(new UnityEngine.Rect(0, 0, w, h), 0, 0); tex.Apply();
  UnityEngine.RenderTexture.active = prev; cam.targetTexture = null; rt.Release();
  System.IO.File.WriteAllBytes(file, UnityEngine.ImageConversion.EncodeToPNG(tex)); UnityEngine.Object.DestroyImmediate(tex);
};
try {
  foreach (var j in jobs) {
    var go = (UnityEngine.GameObject)UnityEngine.Object.Instantiate(UnityEditor.AssetDatabase.LoadAssetAtPath<UnityEngine.GameObject>("Assets/Art/Vehicles/" + j[0] + ".prefab"));
    try {
      go.transform.position = origin;
      foreach (var ps in go.GetComponentsInChildren<UnityEngine.ParticleSystemRenderer>(true)) ps.enabled = false;
      var b = new UnityEngine.Bounds(); bool first = true;
      foreach (var r in go.GetComponentsInChildren<UnityEngine.MeshRenderer>()) { if (first) { b = r.bounds; first = false; } else b.Encapsulate(r.bounds); }
      // side profile, orthographic, vehicle facing screen-right; sized on a fixed metres-per-pixel scale so the roster compares honestly
      keyGo.transform.rotation = UnityEngine.Quaternion.LookRotation(new UnityEngine.Vector3(-1f, -0.9f, 0.35f).normalized);
      if (j[1] == "traysikel") { cam.orthographic = true; cam.orthographicSize = 1.6f; cam.transform.position = new UnityEngine.Vector3(b.center.x + 20f, origin.y + 1.5f, b.center.z); cam.transform.rotation = UnityEngine.Quaternion.LookRotation(UnityEngine.Vector3.left); shoot(outDir + "/_warmup.png", 64, 32); }
      cam.orthographic = true; float metresTall = 3.2f; cam.orthographicSize = metresTall * 0.5f;
      cam.transform.position = new UnityEngine.Vector3(b.center.x + 20f, origin.y + metresTall * 0.5f - 0.05f, b.center.z);
      cam.transform.rotation = UnityEngine.Quaternion.LookRotation(UnityEngine.Vector3.left, UnityEngine.Vector3.up);
      shoot(outDir + "/" + j[1] + "-side.png", 1600, 800); // 1600x800 => 6.4 m x 3.2 m, 250 px per metre
      // three-quarter hero, perspective, framed on bounds
      cam.orthographic = false; cam.fieldOfView = 30f; keyGo.transform.rotation = UnityEngine.Quaternion.LookRotation(new UnityEngine.Vector3(-0.9f, -0.8f, -0.5f).normalized);
      float rad = b.extents.magnitude; float dist = rad / UnityEngine.Mathf.Sin(UnityEngine.Mathf.Deg2Rad * 15f) * 0.82f;
      var dir = new UnityEngine.Vector3(0.75f, 0.32f, 0.85f).normalized;
      cam.transform.position = b.center + dir * dist; cam.transform.LookAt(b.center);
      shoot(outDir + "/" + j[1] + "-hero.png", 1400, 1000);
      sb.Append(j[1] + " size " + b.size.ToString("F2") + "\n");
    } finally { UnityEngine.Object.DestroyImmediate(go); }
  }
} finally {
  UnityEngine.Object.DestroyImmediate(camGo); UnityEngine.Object.DestroyImmediate(keyGo); foreach (var l in sceneLights) if (l) l.enabled = true; foreach (var o in others) if (o) o.enabled = true; UnityEngine.RenderSettings.fog = fog;
}
return sb.ToString();
