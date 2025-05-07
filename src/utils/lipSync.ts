import { Object3D, Vector3 } from 'three';

export class LipSyncController {
  private model: Object3D | null = null;
  private isAnimating = false;
  private animationFrame: number | null = null;
  private initialScale: number = 1.2;
  private initialPosition: Vector3 = new Vector3(0, -1.5, 0);
  private animationStyle: number = 0;
  private lastStyleChange: number = 0;
  private styleChangeDuration: number = 3000; // 3秒ごとにスタイル変更

  setModel(model: Object3D) {
    this.model = model;
    this.initialPosition.copy(model.position);
  }

  startTalking() {
    if (!this.model || this.isAnimating) return;
    this.isAnimating = true;
    this.animate();
  }

  stopTalking() {
    this.isAnimating = false;
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // モデルを初期状態に戻す
    if (this.model) {
      this.model.scale.setScalar(this.initialScale);
      this.model.rotation.set(0, this.model.rotation.y, 0);
      this.model.position.copy(this.initialPosition);
    }
  }

  private getRandomAnimationStyle(): number {
    return Math.floor(Math.random() * 5); // 0-4のアニメーションスタイル
  }

  private animate() {
    if (!this.isAnimating || !this.model) return;

    const currentTime = Date.now();
    const time = currentTime * 0.003;

    // 一定時間ごとにアニメーションスタイルを変更
    if (currentTime - this.lastStyleChange > this.styleChangeDuration) {
      this.animationStyle = this.getRandomAnimationStyle();
      this.lastStyleChange = currentTime;
    }

    let rotationX = 0, rotationZ = 0, scaleChange = 0;
    let positionY = this.initialPosition.y;

    switch (this.animationStyle) {
      case 0: // 基本的な揺れ動き
        rotationX = Math.sin(time * 2) * 0.02;
        rotationZ = Math.cos(time * 1.5) * 0.01;
        scaleChange = Math.sin(time * 4) * 0.02;
        break;
      
      case 1: // 活発な動き
        rotationX = Math.sin(time * 3) * 0.03;
        rotationZ = Math.cos(time * 2.5) * 0.02;
        scaleChange = Math.sin(time * 5) * 0.03;
        positionY = this.initialPosition.y + Math.sin(time * 3) * 0.1;
        break;
      
      case 2: // ゆっくりとした大きな動き
        rotationX = Math.sin(time) * 0.04;
        rotationZ = Math.cos(time * 0.8) * 0.03;
        scaleChange = Math.sin(time * 2) * 0.04;
        break;
      
      case 3: // 複合的な動き
        rotationX = Math.sin(time * 2) * 0.02 + Math.cos(time) * 0.01;
        rotationZ = Math.cos(time * 1.5) * 0.015 + Math.sin(time * 0.5) * 0.01;
        scaleChange = Math.sin(time * 3) * 0.02 + Math.cos(time * 2) * 0.01;
        positionY = this.initialPosition.y + Math.sin(time * 2) * 0.05;
        break;
      
      case 4: // リズミカルな動き
        rotationX = Math.sin(time * 4) * 0.015;
        rotationZ = Math.cos(time * 3) * 0.01;
        scaleChange = Math.abs(Math.sin(time * 6)) * 0.02;
        positionY = this.initialPosition.y + Math.abs(Math.sin(time * 4)) * 0.08;
        break;
    }

    // アニメーションを適用
    this.model.rotation.x = rotationX;
    this.model.rotation.z = rotationZ;
    this.model.scale.setScalar(this.initialScale + scaleChange);
    this.model.position.y = positionY;

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }
}