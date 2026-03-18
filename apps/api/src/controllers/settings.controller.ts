import { Request, Response, NextFunction } from 'express';
import { settingsService } from '@/services/settings.service';
import { asyncHandler } from '@/middlewares/error';

export class SettingsController {
  /**
   * Get all settings
   * GET /api/settings
   */
  list = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const settings = await settingsService.getSettings(req.user!.id, req.user!.role);
    res.json(settings);
  });

  /**
   * Get setting by key
   * GET /api/settings/:key
   */
  get = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const key = String(req.params.key);
    const setting = await settingsService.getSettingByKey(req.user!.id, req.user!.role, key);
    res.json(setting);
  });

  /**
   * Create or update setting
   * PUT /api/settings/:key
   */
  upsert = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const key = String(req.params.key);
    const { value } = req.body;
    const setting = await settingsService.upsertSetting(req.user!.id, key, value);
    res.json(setting);
  });

  /**
   * Update multiple settings
   * POST /api/settings/bulk
   */
  updateBulk = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const settings = await settingsService.updateMultipleSettings(req.user!.id, req.body);
    res.json(settings);
  });

  /**
   * Delete setting
   * DELETE /api/settings/:key
   */
  delete = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const key = String(req.params.key);
    const result = await settingsService.deleteSetting(req.user!.id, req.user!.role, key);
    res.json(result);
  });

  /**
   * Get company settings
   * GET /api/settings/company
   */
  getCompany = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const settings = await settingsService.getCompanySettings(req.user!.id);
    res.json(settings);
  });

  /**
   * Update company settings
   * PUT /api/settings/company
   */
  updateCompany = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const settings = await settingsService.updateCompanySettings(req.user!.id, req.body);
    res.json(settings);
  });
}

export const settingsController = new SettingsController();
