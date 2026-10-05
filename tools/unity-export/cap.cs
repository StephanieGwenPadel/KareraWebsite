// Captures stills and chase-cam frame sequences of each map for the website.
// Reads Temp/web/cap-args.txt: "<mapIndex> <mode>" where mode = stills | frames
var args = System.IO.File.ReadAllText("Temp/web/cap-args.txt").Trim().Split(' ');
int mapIdx = int.Parse(args[0]); string mode = args[1];
string outRoot = "E:/Desktop/Karera Website/public/maps";
string[] slugs = { "san-isidro", "vigan", "cagayan-de-oro", "bustos", "bukidnon", "manila", "national-road" };
// the map's own chapter vehicle leads every shot
string[][] fields = {
  new[]{"Jeepney","Keso","Tricycle","Padyak","HabalHabal"},
  new[]{"Kalesa","Tricycle","Padyak","Motorela","Keso"},
  new[]{"Motorela","Jeepney","Tricycle","HabalHabal","Keso"},
  new[]{"Tricycle","Padyak","Jeepney","Motorela","Keso"},
  new[]{"HabalHabal","Jeepney","Keso","Tricycle","Motorela"},
  new[]{"Jeepney","Tricycle","Motorela","Keso","HabalHabal"},
  new[]{"Keso","Jeepney","Padyak","Tricycle","HabalHabal"},
};
var cat = UnityEditor.AssetDatabase.LoadAssetAtPath<Karera.Data.MapCatalog>("Assets/Data/Maps_Karera.asset");
var track = cat.TrackOf(mapIdx);
string scenePath = "Assets/Scenes/" + cat.SceneNameOf(mapIdx) + ".unity";
if (UnityEngine.SceneManagement.SceneManager.GetActiveScene().isDirty) return "active scene dirty; aborting";
UnityEditor.SceneManagement.EditorSceneManager.OpenScene(scenePath, UnityEditor.SceneManagement.OpenSceneMode.Single);
string dir = outRoot + "/" + slugs[mapIdx]; System.IO.Directory.CreateDirectory(dir);

var spawned = new System.Collections.Generic.List<UnityEngine.GameObject>();
System.Func<string, UnityEngine.GameObject> spawn = (name) => {
  var path = "Assets/Art/Vehicles/" + (name == "Tricycle" ? "Tricycle/Tricycle" : name + "/" + name) + ".prefab";
  var go = (UnityEngine.GameObject)UnityEngine.Object.Instantiate(UnityEditor.AssetDatabase.LoadAssetAtPath<UnityEngine.GameObject>(path));
  foreach (var c in go.GetComponentsInChildren<UnityEngine.Collider>(true)) c.enabled = false;
  foreach (var ps in go.GetComponentsInChildren<UnityEngine.ParticleSystemRenderer>(true)) ps.enabled = false;
  spawned.Add(go); return go;
};
System.Func<UnityEngine.Vector3, UnityEngine.Vector3> ground = (p) => {
  UnityEngine.RaycastHit hit;
  if (UnityEngine.Physics.Raycast(p + UnityEngine.Vector3.up * 6f, UnityEngine.Vector3.down, out hit, 20f, ~0, UnityEngine.QueryTriggerInteraction.Ignore)) return hit.point;
  return p;
};
// place a vehicle at lap distance d metres with lateral offset
System.Action<UnityEngine.GameObject, float, float> place = (go, d, lat) => {
  float lap = track.LapLength; d = ((d % lap) + lap) % lap;
  int i = 0; float t = 0f;
  for (int j = 0; j < track.Count; j++) { float d0 = track.DistanceAt(j), d1 = track.DistanceAt(j + 1); if (d1 < d0) d1 += lap; float dd = d < d0 ? d + lap : d; if (dd >= d0 && dd < d1) { i = j; t = (dd - d0) / UnityEngine.Mathf.Max(0.01f, d1 - d0); break; } }
  var a = track.Point(i, lat); var b = track.Point(i + 1, lat);
  var p = ground(UnityEngine.Vector3.Lerp(a, b, UnityEngine.Mathf.Clamp01(t)));
  var ahead = track.Point(i + 3, lat); var fwd = ahead - p; fwd.y = 0;
  var rot = UnityEngine.Quaternion.LookRotation(fwd.normalized, UnityEngine.Vector3.up);
  var front = ground(p + rot * UnityEngine.Vector3.forward * 1.2f); var back = ground(p - rot * UnityEngine.Vector3.forward * 1.2f);
  go.transform.SetPositionAndRotation(p, UnityEngine.Quaternion.LookRotation((front - back).normalized, UnityEngine.Vector3.up));
};

var camGo = new UnityEngine.GameObject("WebCaptureCam"); spawned.Add(camGo);
var cam = camGo.AddComponent<UnityEngine.Camera>();
cam.nearClipPlane = 0.1f; cam.farClipPlane = 2000f; cam.fieldOfView = 55f;
var urpData = camGo.AddComponent<UnityEngine.Rendering.Universal.UniversalAdditionalCameraData>();
urpData.renderPostProcessing = true; urpData.antialiasing = UnityEngine.Rendering.Universal.AntialiasingMode.SubpixelMorphologicalAntiAliasing;
// switch off other cameras so nothing else draws over us
foreach (var other in UnityEngine.Object.FindObjectsByType<UnityEngine.Camera>(UnityEngine.FindObjectsSortMode.None)) if (other != cam) other.enabled = false;

System.Action<string, int, int, int> shoot = (file, w, h, q) => {
  var rt = new UnityEngine.RenderTexture(w, h, 24, UnityEngine.RenderTextureFormat.ARGB32); rt.antiAliasing = 4;
  cam.targetTexture = rt; cam.aspect = (float)w / h; cam.Render();
  var prev = UnityEngine.RenderTexture.active; UnityEngine.RenderTexture.active = rt;
  var tex = new UnityEngine.Texture2D(w, h, UnityEngine.TextureFormat.RGB24, false);
  tex.ReadPixels(new UnityEngine.Rect(0, 0, w, h), 0, 0); tex.Apply();
  UnityEngine.RenderTexture.active = prev; cam.targetTexture = null; rt.Release(); UnityEngine.Object.DestroyImmediate(rt);
  System.IO.File.WriteAllBytes(file, UnityEngine.ImageConversion.EncodeToJPG(tex, q)); UnityEngine.Object.DestroyImmediate(tex);
};
System.Action<UnityEngine.Transform, float, float, float, float> chase = (target, back, up, lookAhead, side) => {
  var t = target; var pos = t.position - t.forward * back + UnityEngine.Vector3.up * up + t.right * side;
  cam.transform.position = pos; cam.transform.LookAt(t.position + t.forward * lookAhead + UnityEngine.Vector3.up * 0.9f);
};
var spinners = new System.Collections.Generic.List<UnityEngine.Transform>();
var report = new System.Text.StringBuilder();
try {
  UnityEngine.Physics.SyncTransforms();
  var field = fields[mapIdx];
  var cars = new UnityEngine.GameObject[field.Length];
  for (int k = 0; k < field.Length; k++) { cars[k] = spawn(field[k]); foreach (var tr in cars[k].GetComponentsInChildren<UnityEngine.Transform>()) if (tr.name == "Spin") spinners.Add(tr); }
  float lap = track.LapLength; float w = track.RoadWidth;
  float start = track.DistanceAt(track.FinishLineIndex);
  if (mode == "stills") {
    // 1. the grid: five cars staggered behind the line, shot from behind
    for (int k = 0; k < cars.Length; k++) place(cars[k], start - 16f - k * 5.5f, (k % 2 == 0 ? -1 : 1) * w * 0.2f);
    cam.fieldOfView = 50f;
    cam.transform.position = cars[cars.Length - 1].transform.position - cars[cars.Length - 1].transform.forward * 9f + UnityEngine.Vector3.up * 4.2f;
    cam.transform.LookAt(cars[0].transform.position + UnityEngine.Vector3.up * 0.8f);
    shoot(dir + "/grid.jpg", 1920, 1080, 88);
    // 2. front of the grid, low, looking back at the pack
    cam.fieldOfView = 42f;
    cam.transform.position = cars[0].transform.position + cars[0].transform.forward * 9f + UnityEngine.Vector3.up * 1.1f + cars[0].transform.right * 2.2f;
    cam.transform.LookAt(cars[1].transform.position + UnityEngine.Vector3.up * 0.9f);
    shoot(dir + "/pack.jpg", 1920, 1080, 88);
    // 3. action shots: lead car at four points round the lap, others strung behind it
    for (int s = 0; s < 4; s++) {
      float d = start + lap * (0.18f + s * 0.2f);
      for (int k = 0; k < cars.Length; k++) place(cars[k], d - k * 7f, (k % 2 == 0 ? 1 : -1) * w * 0.15f);
      cam.fieldOfView = 55f;
      if (s % 2 == 0) chase(cars[0].transform, 6.5f, 2.4f, 10f, 0f);
      else { cam.transform.position = cars[0].transform.position + cars[0].transform.forward * 7f + cars[0].transform.right * (w * 0.45f) + UnityEngine.Vector3.up * 1.4f; cam.transform.LookAt(cars[0].transform.position + UnityEngine.Vector3.up * 0.8f); }
      shoot(dir + "/action-" + (s + 1) + ".jpg", 1920, 1080, 88);
    }
    // 4. aerial three-quarter view of the whole circuit
    var bmin = new UnityEngine.Vector3(1e9f, 1e9f, 1e9f); var bmax = -bmin;
    for (int i = 0; i < track.Count; i++) { bmin = UnityEngine.Vector3.Min(bmin, track.Centre(i)); bmax = UnityEngine.Vector3.Max(bmax, track.Centre(i)); }
    var centre = (bmin + bmax) * 0.5f; float span = UnityEngine.Mathf.Max(bmax.x - bmin.x, bmax.z - bmin.z);
    UnityEngine.RenderSettings.fog = false; cam.fieldOfView = 45f;
    // a long, thin lap (the national road) frames mostly empty terrain at the usual distance
    float reach = mapIdx == 6 ? 0.62f : 0.95f;
    cam.transform.position = centre + new UnityEngine.Vector3(-0.55f, 0.75f, -0.7f).normalized * span * reach;
    cam.transform.LookAt(centre); cam.farClipPlane = 4000f;
    shoot(dir + "/aerial.jpg", 1920, 1080, 88);
    cam.transform.position = centre + new UnityEngine.Vector3(0.6f, 0.45f, 0.65f).normalized * span * 0.75f;
    cam.transform.LookAt(centre);
    shoot(dir + "/aerial-2.jpg", 1920, 1080, 88);
    report.Append("stills ok " + dir);
  } else {
    // chase-cam frame sequence: the field drives a stretch of the lap at a steady 17 m/s
    int frames = int.Parse(args[2]); float from = start + lap * float.Parse(args[3], System.Globalization.CultureInfo.InvariantCulture);
    string fdir = "Temp/web/frames/" + slugs[mapIdx]; if (System.IO.Directory.Exists(fdir)) System.IO.Directory.Delete(fdir, true); System.IO.Directory.CreateDirectory(fdir);
    float speed = 17f, dt = 1f / 30f; cam.fieldOfView = 60f;
    var camPos = UnityEngine.Vector3.zero; var camLook = UnityEngine.Vector3.zero;
    for (int f = 0; f < frames; f++) {
      float d = from + f * dt * speed;
      for (int k = 0; k < cars.Length; k++) place(cars[k], d + 6f + k * 6.5f, (k % 2 == 0 ? 1 : -1) * w * 0.17f + UnityEngine.Mathf.Sin(f * 0.03f + k) * 0.6f);
      foreach (var sp in spinners) sp.localRotation = UnityEngine.Quaternion.Euler(f * 140f, 0, 0);
      var lead = cars[0].transform; // the camera rides behind the chapter vehicle with the pack ahead
      var wantPos = lead.position - lead.forward * 6.5f + UnityEngine.Vector3.up * 2.6f;
      var wantLook = lead.position + lead.forward * 14f + UnityEngine.Vector3.up * 0.8f;
      if (f == 0) { camPos = wantPos; camLook = wantLook; }
      camPos = UnityEngine.Vector3.Lerp(camPos, wantPos, 0.18f); camLook = UnityEngine.Vector3.Lerp(camLook, wantLook, 0.25f);
      cam.transform.position = camPos; cam.transform.LookAt(camLook);
      shoot(fdir + "/f" + f.ToString("0000") + ".jpg", 1280, 720, 90);
    }
    report.Append("frames ok " + frames);
  }
} finally {
  foreach (var g in spawned) if (g) UnityEngine.Object.DestroyImmediate(g);
  // nothing here is saved; reopen the scene clean so it is not left dirty
  UnityEditor.SceneManagement.EditorSceneManager.OpenScene(scenePath, UnityEditor.SceneManagement.OpenSceneMode.Single);
}
return report.ToString();
