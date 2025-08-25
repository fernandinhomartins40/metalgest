const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authMiddleware } = require('../middleware/auth');
const { AppError } = require('../utils/errors');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Configuração do Multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Gerar nome único com timestamp
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2);
    const ext = path.extname(file.originalname);
    const name = `${timestamp}_${randomStr}${ext}`;
    cb(null, name);
  }
});

// Filtro de arquivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de arquivo não permitido', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Máximo 5 arquivos
  }
});

// Upload de arquivo único
router.post('/single', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'Nenhum arquivo enviado' }
      });
    }

    const fileInfo = {
      id: req.file.filename,
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: fileInfo,
      message: 'Arquivo enviado com sucesso'
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    if (error instanceof multer.MulterError) {
      let message = 'Erro no upload do arquivo';
      
      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          message = 'Arquivo muito grande. Limite: 10MB';
          break;
        case 'LIMIT_FILE_COUNT':
          message = 'Muitos arquivos. Limite: 5 arquivos';
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          message = 'Campo de arquivo inesperado';
          break;
      }
      
      return res.status(400).json({
        success: false,
        error: { message }
      });
    }
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: { message: error.message }
      });
    }
    
    res.status(500).json({
      success: false,
      error: { message: 'Erro interno do servidor' }
    });
  }
});

// Upload de múltiplos arquivos
router.post('/multiple', upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Nenhum arquivo enviado' }
      });
    }

    const filesInfo = req.files.map(file => ({
      id: file.filename,
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString()
    }));

    res.json({
      success: true,
      data: filesInfo,
      message: `${req.files.length} arquivo(s) enviado(s) com sucesso`
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    
    if (error instanceof multer.MulterError) {
      let message = 'Erro no upload dos arquivos';
      
      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          message = 'Um ou mais arquivos são muito grandes. Limite: 10MB cada';
          break;
        case 'LIMIT_FILE_COUNT':
          message = 'Muitos arquivos. Limite: 5 arquivos';
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          message = 'Campo de arquivo inesperado';
          break;
      }
      
      return res.status(400).json({
        success: false,
        error: { message }
      });
    }
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: { message: error.message }
      });
    }
    
    res.status(500).json({
      success: false,
      error: { message: 'Erro interno do servidor' }
    });
  }
});

// Listar arquivos enviados
router.get('/files', async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    try {
      const files = await fs.readdir(uploadsDir);
      const filesInfo = [];

      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stats = await fs.stat(filePath);
        
        filesInfo.push({
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          path: `/uploads/${file}`
        });
      }

      // Ordenar por data de criação (mais recentes primeiro)
      filesInfo.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({
        success: true,
        data: filesInfo
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.json({
          success: true,
          data: []
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao listar arquivos' }
    });
  }
});

// Deletar arquivo
router.delete('/files/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validar nome do arquivo para evitar path traversal
    if (filename.includes('../') || filename.includes('..\\')) {
      return res.status(400).json({
        success: false,
        error: { message: 'Nome de arquivo inválido' }
      });
    }

    const filePath = path.join(__dirname, '../../uploads', filename);
    
    try {
      await fs.unlink(filePath);
      
      res.json({
        success: true,
        message: 'Arquivo deletado com sucesso'
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          success: false,
          error: { message: 'Arquivo não encontrado' }
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao deletar arquivo' }
    });
  }
});

// Servir arquivos estáticos
router.get('/files/:filename/download', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validar nome do arquivo para evitar path traversal
    if (filename.includes('../') || filename.includes('..\\')) {
      return res.status(400).json({
        success: false,
        error: { message: 'Nome de arquivo inválido' }
      });
    }

    const filePath = path.join(__dirname, '../../uploads', filename);
    
    try {
      await fs.access(filePath);
      res.download(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          success: false,
          error: { message: 'Arquivo não encontrado' }
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao baixar arquivo' }
    });
  }
});

module.exports = router;