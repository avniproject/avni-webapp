export default class {
  static download(filename, content) {
    const anchorTag = document.createElement("a");
    anchorTag.href = window.URL.createObjectURL(new Blob([content]));
    anchorTag.setAttribute("download", filename);
    document.body.appendChild(anchorTag);
    anchorTag.click();
  }
}
