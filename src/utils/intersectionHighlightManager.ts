import { IntersectionArea } from './intersectionUtils';

/**
 * 交集高亮管理器 - 單一職責原則
 * 專門處理交集區域的高亮狀態管理
 */
export class IntersectionHighlightManager {
  private highlightedIntersections = new Map<string, boolean>();

  /**
   * 設置交集高亮狀態
   * @param intersectionId 交集ID
   * @param highlighted 是否高亮
   */
  setHighlight(intersectionId: string, highlighted: boolean): void {
    this.highlightedIntersections.set(intersectionId, highlighted);
  }

  /**
   * 切換交集高亮狀態
   * @param intersectionId 交集ID
   * @returns 新的高亮狀態
   */
  toggleHighlight(intersectionId: string): boolean {
    const current = this.highlightedIntersections.get(intersectionId) || false;
    const newState = !current;
    this.highlightedIntersections.set(intersectionId, newState);
    return newState;
  }

  /**
   * 清除所有高亮狀態
   */
  clearAllHighlights(): void {
    this.highlightedIntersections.clear();
  }

  /**
   * 檢查交集是否被高亮
   * @param intersectionId 交集ID
   * @returns 是否高亮
   */
  isHighlighted(intersectionId: string): boolean {
    return this.highlightedIntersections.get(intersectionId) || false;
  }

  /**
   * 獲取所有高亮的交集ID
   * @returns 高亮的交集ID數組
   */
  getHighlightedIds(): string[] {
    return Array.from(this.highlightedIntersections.entries())
      .filter(([, highlighted]) => highlighted)
      .map(([id]) => id);
  }

  /**
   * 應用高亮狀態到交集數組
   * @param intersections 交集數組
   * @returns 更新後的交集數組
   */
  applyHighlights(intersections: IntersectionArea[]): IntersectionArea[] {
    return intersections.map(intersection => ({
      ...intersection,
      isHighlighted: this.isHighlighted(intersection.id)
    }));
  }
}

/**
 * 全局交集高亮管理器實例
 * 使用單例模式確保狀態一致性
 */
export const intersectionHighlightManager = new IntersectionHighlightManager();