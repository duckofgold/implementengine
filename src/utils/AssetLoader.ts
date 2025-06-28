export interface LoadedAsset<T = any> {
    name: string;
    data: T;
    loaded: boolean;
    error?: string;
}

export class AssetLoader {
    private static _instance: AssetLoader;
    private loadedAssets: Map<string, LoadedAsset> = new Map();
    private loadingPromises: Map<string, Promise<any>> = new Map();

    private constructor() {}

    public static getInstance(): AssetLoader {
        if (!AssetLoader._instance) {
            AssetLoader._instance = new AssetLoader();
        }
        return AssetLoader._instance;
    }

    public static async loadImage(name: string, url: string): Promise<HTMLImageElement> {
        return AssetLoader.getInstance().loadImage(name, url);
    }

    public static async loadAudio(name: string, url: string): Promise<HTMLAudioElement> {
        return AssetLoader.getInstance().loadAudio(name, url);
    }

    public static async loadJSON(name: string, url: string): Promise<any> {
        return AssetLoader.getInstance().loadJSON(name, url);
    }

    public static async loadText(name: string, url: string): Promise<string> {
        return AssetLoader.getInstance().loadText(name, url);
    }

    public static getAsset<T = any>(name: string): T | null {
        return AssetLoader.getInstance().getAsset<T>(name);
    }

    public static isLoaded(name: string): boolean {
        return AssetLoader.getInstance().isLoaded(name);
    }

    public static async loadMultiple(assets: { name: string; url: string; type: 'image' | 'audio' | 'json' | 'text' }[]): Promise<void> {
        return AssetLoader.getInstance().loadMultiple(assets);
    }

    public async loadImage(name: string, url: string): Promise<HTMLImageElement> {
        if (this.loadedAssets.has(name)) {
            const asset = this.loadedAssets.get(name)!;
            if (asset.loaded) {
                return asset.data as HTMLImageElement;
            }
        }

        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name)! as Promise<HTMLImageElement>;
        }

        const promise = new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                const asset: LoadedAsset<HTMLImageElement> = {
                    name,
                    data: img,
                    loaded: true
                };
                this.loadedAssets.set(name, asset);
                this.loadingPromises.delete(name);
                resolve(img);
            };

            img.onerror = () => {
                const asset: LoadedAsset<HTMLImageElement> = {
                    name,
                    data: img,
                    loaded: false,
                    error: `Failed to load image: ${url}`
                };
                this.loadedAssets.set(name, asset);
                this.loadingPromises.delete(name);
                reject(new Error(`Failed to load image: ${url}`));
            };

            img.src = url;
        });

        this.loadingPromises.set(name, promise);
        return promise;
    }

    public async loadAudio(name: string, url: string): Promise<HTMLAudioElement> {
        if (this.loadedAssets.has(name)) {
            const asset = this.loadedAssets.get(name)!;
            if (asset.loaded) {
                return asset.data as HTMLAudioElement;
            }
        }

        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name)! as Promise<HTMLAudioElement>;
        }

        const promise = new Promise<HTMLAudioElement>((resolve, reject) => {
            const audio = new Audio();
            
            audio.oncanplaythrough = () => {
                const asset: LoadedAsset<HTMLAudioElement> = {
                    name,
                    data: audio,
                    loaded: true
                };
                this.loadedAssets.set(name, asset);
                this.loadingPromises.delete(name);
                resolve(audio);
            };

            audio.onerror = () => {
                const asset: LoadedAsset<HTMLAudioElement> = {
                    name,
                    data: audio,
                    loaded: false,
                    error: `Failed to load audio: ${url}`
                };
                this.loadedAssets.set(name, asset);
                this.loadingPromises.delete(name);
                reject(new Error(`Failed to load audio: ${url}`));
            };

            audio.src = url;
            audio.load();
        });

        this.loadingPromises.set(name, promise);
        return promise;
    }

    public async loadJSON(name: string, url: string): Promise<any> {
        if (this.loadedAssets.has(name)) {
            const asset = this.loadedAssets.get(name)!;
            if (asset.loaded) {
                return asset.data;
            }
        }

        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name)!;
        }

        const promise = fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const asset: LoadedAsset = {
                    name,
                    data,
                    loaded: true
                };
                this.loadedAssets.set(name, asset);
                this.loadingPromises.delete(name);
                return data;
            })
            .catch(error => {
                const asset: LoadedAsset = {
                    name,
                    data: null,
                    loaded: false,
                    error: `Failed to load JSON: ${error.message}`
                };
                this.loadedAssets.set(name, asset);
                this.loadingPromises.delete(name);
                throw error;
            });

        this.loadingPromises.set(name, promise);
        return promise;
    }

    public async loadText(name: string, url: string): Promise<string> {
        if (this.loadedAssets.has(name)) {
            const asset = this.loadedAssets.get(name)!;
            if (asset.loaded) {
                return asset.data as string;
            }
        }

        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name)! as Promise<string>;
        }

        const promise = fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                const asset: LoadedAsset<string> = {
                    name,
                    data: text,
                    loaded: true
                };
                this.loadedAssets.set(name, asset);
                this.loadingPromises.delete(name);
                return text;
            })
            .catch(error => {
                const asset: LoadedAsset<string> = {
                    name,
                    data: '',
                    loaded: false,
                    error: `Failed to load text: ${error.message}`
                };
                this.loadedAssets.set(name, asset);
                this.loadingPromises.delete(name);
                throw error;
            });

        this.loadingPromises.set(name, promise);
        return promise;
    }

    public getAsset<T = any>(name: string): T | null {
        const asset = this.loadedAssets.get(name);
        return asset && asset.loaded ? asset.data as T : null;
    }

    public isLoaded(name: string): boolean {
        const asset = this.loadedAssets.get(name);
        return asset ? asset.loaded : false;
    }

    public isLoading(name: string): boolean {
        return this.loadingPromises.has(name);
    }

    public getAllAssets(): readonly LoadedAsset[] {
        return Array.from(this.loadedAssets.values());
    }

    public getLoadedAssets(): readonly LoadedAsset[] {
        return Array.from(this.loadedAssets.values()).filter(asset => asset.loaded);
    }

    public getFailedAssets(): readonly LoadedAsset[] {
        return Array.from(this.loadedAssets.values()).filter(asset => !asset.loaded && asset.error);
    }

    public async loadMultiple(assets: { name: string; url: string; type: 'image' | 'audio' | 'json' | 'text' }[]): Promise<void> {
        const promises = assets.map(asset => {
            switch (asset.type) {
                case 'image':
                    return this.loadImage(asset.name, asset.url);
                case 'audio':
                    return this.loadAudio(asset.name, asset.url);
                case 'json':
                    return this.loadJSON(asset.name, asset.url);
                case 'text':
                    return this.loadText(asset.name, asset.url);
                default:
                    throw new Error(`Unknown asset type: ${asset.type}`);
            }
        });

        await Promise.all(promises);
    }

    public unload(name: string): boolean {
        const deleted = this.loadedAssets.delete(name);
        this.loadingPromises.delete(name);
        return deleted;
    }

    public unloadAll(): void {
        this.loadedAssets.clear();
        this.loadingPromises.clear();
    }
}