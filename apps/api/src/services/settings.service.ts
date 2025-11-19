import { prisma } from '@/config/database';
import { AppError } from '@/middlewares/error';

export class SettingsService {
  /**
   * Get all settings for a user
   */
  async getSettings(userId: string, userRole: string) {
    const where: any = {};

    // Non-admin users can only see their own settings
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const settings = await prisma.setting.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Convert array to key-value object
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        updatedAt: setting.updatedAt,
      };
      return acc;
    }, {} as Record<string, any>);

    return settingsObject;
  }

  /**
   * Get a specific setting by key
   */
  async getSettingByKey(userId: string, userRole: string, key: string) {
    const where: any = { key };

    // Non-admin users can only see their own settings
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const setting = await prisma.setting.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!setting) {
      throw new AppError(404, 'Setting not found', 'SETTING_NOT_FOUND');
    }

    return setting;
  }

  /**
   * Create or update a setting
   */
  async upsertSetting(userId: string, key: string, value: string) {
    // Check if setting exists
    const existingSetting = await prisma.setting.findFirst({
      where: {
        userId,
        key,
      },
    });

    if (existingSetting) {
      // Update existing setting
      const setting = await prisma.setting.update({
        where: { id: existingSetting.id },
        data: { value },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return setting;
    } else {
      // Create new setting
      const setting = await prisma.setting.create({
        data: {
          userId,
          key,
          value,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return setting;
    }
  }

  /**
   * Update multiple settings at once
   */
  async updateMultipleSettings(userId: string, settings: Record<string, string>) {
    const operations = Object.entries(settings).map(([key, value]) => {
      return prisma.setting.upsert({
        where: {
          userId_key: {
            userId,
            key,
          },
        },
        update: {
          value,
        },
        create: {
          userId,
          key,
          value,
        },
      });
    });

    await prisma.$transaction(operations);

    // Return updated settings
    return this.getSettings(userId, 'USER');
  }

  /**
   * Delete a setting
   */
  async deleteSetting(userId: string, userRole: string, key: string) {
    const where: any = { key };

    // Non-admin users can only delete their own settings
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const setting = await prisma.setting.findFirst({ where });

    if (!setting) {
      throw new AppError(404, 'Setting not found', 'SETTING_NOT_FOUND');
    }

    await prisma.setting.delete({ where: { id: setting.id } });

    return { message: 'Setting deleted successfully' };
  }

  /**
   * Get company settings (for invoices, quotes, etc.)
   */
  async getCompanySettings(userId: string) {
    const companyKeys = [
      'company.name',
      'company.email',
      'company.phone',
      'company.address',
      'company.city',
      'company.state',
      'company.zipCode',
      'company.country',
      'company.taxId',
      'company.logo',
      'company.website',
    ];

    const settings = await prisma.setting.findMany({
      where: {
        userId,
        key: {
          in: companyKeys,
        },
      },
    });

    const companySettings = settings.reduce((acc, setting) => {
      const keyWithoutPrefix = setting.key.replace('company.', '');
      acc[keyWithoutPrefix] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return companySettings;
  }

  /**
   * Update company settings
   */
  async updateCompanySettings(userId: string, data: Record<string, string>) {
    const settingsToUpdate = Object.entries(data).reduce((acc, [key, value]) => {
      acc[`company.${key}`] = value;
      return acc;
    }, {} as Record<string, string>);

    await this.updateMultipleSettings(userId, settingsToUpdate);

    return this.getCompanySettings(userId);
  }
}

export const settingsService = new SettingsService();
