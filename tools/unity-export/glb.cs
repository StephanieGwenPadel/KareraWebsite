// Exports Karera vehicle prefabs to binary glTF (.glb) for the website.
// Run in the live editor with: unity command eval_file --file Temp/web/glb.cs
// Unity is left-handed (+Z forward), glTF right-handed: x is mirrored, winding reversed.
var ci = System.Globalization.CultureInfo.InvariantCulture;
string outDir = "E:/Desktop/Karera Website/public/models";
System.IO.Directory.CreateDirectory(outDir);
var jobs = new System.Collections.Generic.List<string[]> {
  new[]{"Assets/Art/Vehicles/Tricycle/Tricycle.prefab","traysikel"},
  new[]{"Assets/Art/Vehicles/Kalesa/Kalesa.prefab","kalesa"},
  new[]{"Assets/Art/Vehicles/Padyak/Padyak.prefab","padyak"},
  new[]{"Assets/Art/Vehicles/Jeepney/Jeepney.prefab","jeepney"},
  new[]{"Assets/Art/Vehicles/HabalHabal/HabalHabal.prefab","habalhabal"},
  new[]{"Assets/Art/Vehicles/HabalHabal/HabalHabal_ThreeUp.prefab","habalhabal-threeup"},
  new[]{"Assets/Art/Vehicles/Keso/Keso.prefab","keso"},
  new[]{"Assets/Art/Vehicles/Motorela/Motorela.prefab","motorela"},
};
var skipNames = new System.Collections.Generic.HashSet<string>{"VFX","Audio","ContactPoints","CenterOfMass"};
var report = new System.Text.StringBuilder();

foreach (var job in jobs) {
  var prefab = UnityEditor.AssetDatabase.LoadAssetAtPath<UnityEngine.GameObject>(job[0]);
  var inst = UnityEditor.PrefabUtility.LoadPrefabContents(job[0]);
  inst.transform.position = UnityEngine.Vector3.zero; inst.transform.rotation = UnityEngine.Quaternion.identity;
  try {
  var bin = new System.IO.MemoryStream();
  var bw = new System.IO.BinaryWriter(bin);
  var views = new System.Text.StringBuilder(); int viewCount = 0;
  var accs = new System.Text.StringBuilder(); int accCount = 0;
  var meshesJ = new System.Text.StringBuilder(); int meshCount = 0;
  var matsJ = new System.Text.StringBuilder(); int matCount = 0;
  var imgsJ = new System.Text.StringBuilder(); int imgCount = 0;
  var nodesJ = new System.Collections.Generic.List<string>();
  var matIndex = new System.Collections.Generic.Dictionary<UnityEngine.Material,int>();
  var meshIndex = new System.Collections.Generic.Dictionary<string,int>();
  int tris = 0;

  System.Func<byte[], int, int> addView = (bytes, target) => {
    while (bin.Length % 4 != 0) bw.Write((byte)0);
    long off = bin.Length; bw.Write(bytes);
    if (viewCount > 0) views.Append(",");
    views.Append("{\"buffer\":0,\"byteOffset\":" + off + ",\"byteLength\":" + bytes.Length + (target > 0 ? ",\"target\":" + target : "") + "}");
    return viewCount++;
  };
  System.Func<float[], int, string, bool, int> addFloatAcc = (data, comps, type, minmax) => {
    var bytes = new byte[data.Length * 4]; System.Buffer.BlockCopy(data, 0, bytes, 0, bytes.Length);
    int v = addView(bytes, 34962); int count = data.Length / comps;
    string mm = "";
    if (minmax) {
      var mn = new float[comps]; var mx = new float[comps];
      for (int c = 0; c < comps; c++) { mn[c] = float.MaxValue; mx[c] = float.MinValue; }
      for (int i = 0; i < count; i++) for (int c = 0; c < comps; c++) { float f = data[i*comps+c]; if (f < mn[c]) mn[c] = f; if (f > mx[c]) mx[c] = f; }
      mm = ",\"min\":[" + string.Join(",", System.Array.ConvertAll(mn, f => f.ToString("R", ci))) + "],\"max\":[" + string.Join(",", System.Array.ConvertAll(mx, f => f.ToString("R", ci))) + "]";
    }
    if (accCount > 0) accs.Append(",");
    accs.Append("{\"bufferView\":" + v + ",\"componentType\":5126,\"count\":" + count + ",\"type\":\"" + type + "\"" + mm + "}");
    return accCount++;
  };
  System.Func<int[], int> addIndexAcc = (data) => {
    var bytes = new byte[data.Length * 4]; System.Buffer.BlockCopy(data, 0, bytes, 0, bytes.Length);
    int v = addView(bytes, 34963);
    if (accCount > 0) accs.Append(",");
    accs.Append("{\"bufferView\":" + v + ",\"componentType\":5125,\"count\":" + data.Length + ",\"type\":\"SCALAR\"}");
    return accCount++;
  };
  System.Func<UnityEngine.Texture, int> addImage = (tex) => {
    var rt = UnityEngine.RenderTexture.GetTemporary(tex.width, tex.height, 0, UnityEngine.RenderTextureFormat.ARGB32, UnityEngine.RenderTextureReadWrite.sRGB);
    UnityEngine.Graphics.Blit(tex, rt);
    var prev = UnityEngine.RenderTexture.active; UnityEngine.RenderTexture.active = rt;
    var t2 = new UnityEngine.Texture2D(tex.width, tex.height, UnityEngine.TextureFormat.RGBA32, false);
    t2.ReadPixels(new UnityEngine.Rect(0, 0, tex.width, tex.height), 0, 0); t2.Apply();
    UnityEngine.RenderTexture.active = prev; UnityEngine.RenderTexture.ReleaseTemporary(rt);
    var png = UnityEngine.ImageConversion.EncodeToPNG(t2); UnityEngine.Object.DestroyImmediate(t2);
    int v = addView(png, 0);
    if (imgCount > 0) imgsJ.Append(",");
    imgsJ.Append("{\"bufferView\":" + v + ",\"mimeType\":\"image/png\"}");
    return imgCount++;
  };
  System.Func<UnityEngine.Material, int> getMat = (m) => {
    if (m == null) return -1;
    int idx; if (matIndex.TryGetValue(m, out idx)) return idx;
    UnityEngine.Color c = m.HasProperty("_BaseColor") ? m.GetColor("_BaseColor") : (m.HasProperty("_Color") ? m.GetColor("_Color") : UnityEngine.Color.white);
    var lin = c.linear;
    float metal = m.HasProperty("_Metallic") ? m.GetFloat("_Metallic") : 0f;
    float smooth = m.HasProperty("_Smoothness") ? m.GetFloat("_Smoothness") : 0.5f;
    bool transparent = m.renderQueue >= 2900 || (m.HasProperty("_Surface") && m.GetFloat("_Surface") > 0.5f);
    var tex = m.HasProperty("_BaseMap") ? m.GetTexture("_BaseMap") : null;
    string texJ = "";
    if (tex != null) { int img = addImage(tex); texJ = ",\"baseColorTexture\":{\"index\":" + img + "}"; }
    string emis = "";
    if (m.IsKeywordEnabled("_EMISSION") && m.HasProperty("_EmissionColor")) {
      var e = m.GetColor("_EmissionColor").linear; float mx = UnityEngine.Mathf.Max(e.r, UnityEngine.Mathf.Max(e.g, e.b));
      if (mx > 0.001f) { float k = mx > 1f ? mx : 1f; emis = ",\"emissiveFactor\":[" + (e.r/k).ToString("0.####",ci) + "," + (e.g/k).ToString("0.####",ci) + "," + (e.b/k).ToString("0.####",ci) + "]" + (k > 1f ? ",\"extensions\":{\"KHR_materials_emissive_strength\":{\"emissiveStrength\":" + k.ToString("0.###",ci) + "}}" : ""); }
    }
    if (matCount > 0) matsJ.Append(",");
    matsJ.Append("{\"name\":\"" + m.name + "\",\"pbrMetallicRoughness\":{\"baseColorFactor\":[" + lin.r.ToString("0.#####",ci) + "," + lin.g.ToString("0.#####",ci) + "," + lin.b.ToString("0.#####",ci) + "," + c.a.ToString("0.###",ci) + "]" + texJ +
      ",\"metallicFactor\":" + metal.ToString("0.###",ci) + ",\"roughnessFactor\":" + (1f - smooth).ToString("0.###",ci) + "}" + emis +
      (transparent ? ",\"alphaMode\":\"BLEND\"" : "") + ",\"doubleSided\":" + (transparent ? "true" : "false") +
      ",\"extras\":{\"shader\":\"" + m.shader.name + "\"}}");
    matIndex[m] = matCount; return matCount++;
  };
  System.Func<UnityEngine.Mesh, UnityEngine.Material[], int> getMesh = (mesh, mats) => {
    string key = mesh.GetInstanceID() + "|" + string.Join(",", System.Array.ConvertAll(mats, x => x ? x.GetInstanceID().ToString() : "0"));
    int idx; if (meshIndex.TryGetValue(key, out idx)) return idx;
    var vs = mesh.vertices; var ns = mesh.normals; var uv = mesh.uv; var cols = mesh.colors;
    var pos = new float[vs.Length * 3];
    for (int i = 0; i < vs.Length; i++) { pos[i*3] = -vs[i].x; pos[i*3+1] = vs[i].y; pos[i*3+2] = vs[i].z; }
    int pa = addFloatAcc(pos, 3, "VEC3", true);
    int na = -1;
    if (ns != null && ns.Length == vs.Length) { var nn = new float[vs.Length * 3]; for (int i = 0; i < vs.Length; i++) { var nv = ns[i].sqrMagnitude > 1e-8f ? ns[i].normalized : UnityEngine.Vector3.up; nn[i*3] = -nv.x; nn[i*3+1] = nv.y; nn[i*3+2] = nv.z; } na = addFloatAcc(nn, 3, "VEC3", false); }
    int ua = -1;
    if (uv != null && uv.Length == vs.Length) { var uu = new float[vs.Length * 2]; for (int i = 0; i < vs.Length; i++) { uu[i*2] = uv[i].x; uu[i*2+1] = 1f - uv[i].y; } ua = addFloatAcc(uu, 2, "VEC2", false); }
    int ca = -1;
    if (cols != null && cols.Length == vs.Length) { var cc = new float[vs.Length * 4]; for (int i = 0; i < vs.Length; i++) { var l = cols[i].linear; cc[i*4] = l.r; cc[i*4+1] = l.g; cc[i*4+2] = l.b; cc[i*4+3] = cols[i].a; } ca = addFloatAcc(cc, 4, "VEC4", false); }
    var prims = new System.Text.StringBuilder();
    for (int s = 0; s < mesh.subMeshCount; s++) {
      if (mesh.GetTopology(s) != UnityEngine.MeshTopology.Triangles) continue;
      var t = mesh.GetTriangles(s); if (t.Length == 0) continue;
      for (int i = 0; i < t.Length; i += 3) { int a = t[i+1]; t[i+1] = t[i+2]; t[i+2] = a; }
      tris += t.Length / 3;
      int ia = addIndexAcc(t);
      int mi = getMat(s < mats.Length ? mats[s] : (mats.Length > 0 ? mats[mats.Length-1] : null));
      if (prims.Length > 0) prims.Append(",");
      prims.Append("{\"attributes\":{\"POSITION\":" + pa + (na >= 0 ? ",\"NORMAL\":" + na : "") + (ua >= 0 ? ",\"TEXCOORD_0\":" + ua : "") + "}" + ",\"indices\":" + ia + (mi >= 0 ? ",\"material\":" + mi : "") + "}");
    }
    if (meshCount > 0) meshesJ.Append(",");
    meshesJ.Append("{\"name\":\"" + mesh.name + "\",\"primitives\":[" + prims + "]}");
    meshIndex[key] = meshCount; return meshCount++;
  };

  // Recursive node walk via an explicit stack-free local function substitute.
  System.Func<UnityEngine.Transform, int> walk = null;
  walk = (tr) => {
    var children = new System.Collections.Generic.List<int>();
    foreach (UnityEngine.Transform ch in tr) {
      if (!ch.gameObject.activeSelf || skipNames.Contains(ch.name)) continue;
      children.Add(walk(ch));
    }
    string meshPart = "";
    var mf = tr.GetComponent<UnityEngine.MeshFilter>(); var mr = tr.GetComponent<UnityEngine.MeshRenderer>();
    if (mf && mr && mr.enabled && mf.sharedMesh) meshPart = ",\"mesh\":" + getMesh(mf.sharedMesh, mr.sharedMaterials);
    var smr = tr.GetComponent<UnityEngine.SkinnedMeshRenderer>();
    if (smr && smr.enabled && smr.sharedMesh) { var baked = new UnityEngine.Mesh(); baked.name = smr.sharedMesh.name; smr.BakeMesh(baked, true); meshPart = ",\"mesh\":" + getMesh(baked, smr.sharedMaterials); }
    var p = tr.localPosition; var q = tr.localRotation; var sc = tr.localScale;
    if (tr == inst.transform) { p = UnityEngine.Vector3.zero; q = UnityEngine.Quaternion.identity; }
    string json = "{\"name\":\"" + tr.name.Replace("\"","") + "\"" +
      ",\"translation\":[" + (-p.x).ToString("R",ci) + "," + p.y.ToString("R",ci) + "," + p.z.ToString("R",ci) + "]" +
      ",\"rotation\":[" + q.x.ToString("R",ci) + "," + (-q.y).ToString("R",ci) + "," + (-q.z).ToString("R",ci) + "," + q.w.ToString("R",ci) + "]" +
      ",\"scale\":[" + sc.x.ToString("R",ci) + "," + sc.y.ToString("R",ci) + "," + sc.z.ToString("R",ci) + "]" + meshPart +
      (children.Count > 0 ? ",\"children\":[" + string.Join(",", children) + "]" : "") + "}";
    nodesJ.Add(json); return nodesJ.Count - 1;
  };
  int root = walk(inst.transform);

  while (bin.Length % 4 != 0) bw.Write((byte)0);
  string jsonStr = "{\"asset\":{\"version\":\"2.0\",\"generator\":\"Karera Unity web exporter\"},\"extensionsUsed\":[\"KHR_materials_emissive_strength\"],\"scene\":0,\"scenes\":[{\"name\":\"" + job[1] + "\",\"nodes\":[" + root + "]}]" +
    ",\"nodes\":[" + string.Join(",", nodesJ) + "]" + ",\"meshes\":[" + meshesJ + "]" + ",\"materials\":[" + matsJ + "]" +
    (imgCount > 0 ? ",\"images\":[" + imgsJ + "],\"samplers\":[{\"magFilter\":9729,\"minFilter\":9987,\"wrapS\":33071,\"wrapT\":33071}],\"textures\":[" + string.Join(",", System.Linq.Enumerable.Select(System.Linq.Enumerable.Range(0, imgCount), i => "{\"source\":" + i + ",\"sampler\":0}")) + "]" : "") +
    ",\"accessors\":[" + accs + "],\"bufferViews\":[" + views + "],\"buffers\":[{\"byteLength\":" + bin.Length + "}]}";
  var jb = System.Text.Encoding.UTF8.GetBytes(jsonStr);
  int jpad = (4 - jb.Length % 4) % 4;
  var binBytes = bin.ToArray();
  using (var fs = new System.IO.FileStream(outDir + "/" + job[1] + ".glb", System.IO.FileMode.Create))
  using (var w = new System.IO.BinaryWriter(fs)) {
    w.Write(0x46546C67u); w.Write(2u); w.Write((uint)(12 + 8 + jb.Length + jpad + 8 + binBytes.Length));
    w.Write((uint)(jb.Length + jpad)); w.Write(0x4E4F534Au); w.Write(jb); for (int i = 0; i < jpad; i++) w.Write((byte)0x20);
    w.Write((uint)binBytes.Length); w.Write(0x004E4942u); w.Write(binBytes);
  }
  var b = new UnityEngine.Bounds(); bool first = true;
  foreach (var r in inst.GetComponentsInChildren<UnityEngine.MeshRenderer>()) { if (first) { b = r.bounds; first = false; } else b.Encapsulate(r.bounds); }
  report.Append(job[1] + ": nodes=" + nodesJ.Count + " meshes=" + meshCount + " mats=" + matCount + " imgs=" + imgCount + " tris=" + tris + " kb=" + ((binBytes.Length + jb.Length) / 1024) + " size=" + b.size.ToString("F2") + " centre=" + b.center.ToString("F2") + "\n");
  } finally { UnityEditor.PrefabUtility.UnloadPrefabContents(inst); }
}
return report.ToString();
