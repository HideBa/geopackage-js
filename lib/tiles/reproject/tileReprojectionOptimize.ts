import { Projection } from '@ngageoint/projections-js';
import { BoundingBox } from '../../boundingBox';
import { TileGrid } from '../tileGrid';

/**
 * Tile Reprojection Optimizations
 */
export abstract class TileReprojectionOptimize {
  /**
   * World tile coordinate bounds (XYZ), as opposed to minimal tile fitting
   * bounds (default)
   */
  private world: boolean;

  /**
   * Constructor
   *
   * @param world world coordinate bounds
   */
  public constructor(world = false) {
    this.world = world;
  }

  /**
   * Is world tile coordinate bounds (XYZ), as opposed to minimal tile fitting
   * bounds
   *
   * @return world flag
   */
  public isWorld(): boolean {
    return this.world;
  }

  /**
   * Set the world tile coordinate bounds (XYZ) vs minimal tile fitting bounds
   * flag
   *
   * @param world
   *            world bounds flag
   */
  public setWorld(world: boolean): void {
    this.world = world;
  }

  /**
   * Get the optimization projection
   *
   * @return projection
   */
  public abstract getProjection(): Projection;

  /**
   * Get the world tile grid of the optimization projection
   *
   * @return tile grid
   */
  public abstract getTileGrid(): TileGrid;

  /**
   * Get the world bounding box of the optimization projection
   *
   * @return bounding box
   */
  public abstract getBoundingBox(): BoundingBox;

  /**
   * Get the tile grid of the bounding box at the zoom
   *
   * @param boundingBox
   *            bounding box
   * @param zoom
   *            zoom level
   *
   * @return tile grid
   */
  public abstract getTileGridFromBoundingBox(boundingBox: BoundingBox, zoom: number): TileGrid;

  /**
   * Get the bounding box of the tile grid at the zoom
   *
   * @param tileGrid
   *            tile grid
   * @param zoom
   *            zoom level
   *
   * @return bounding box
   */
  public abstract getBoundingBoxFromTileGrid(tileGrid: TileGrid, zoom: number): BoundingBox;
}
