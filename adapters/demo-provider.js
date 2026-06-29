export class DemoProvider {
  constructor(path = './data/demo-cockpit.json') {
    this.path = path;
    this.cache = null;
  }

  async load() {
    if (this.cache) return this.cache;
    const response = await fetch(this.path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Demo data load failed: ${response.status}`);
    this.cache = await response.json();
    return this.cache;
  }

  async refresh() {
    this.cache = null;
    return this.load();
  }
}
