# Supabase 数据迁移指南

本目录包含将应用程序从基于JSON文件的存储迁移到Supabase数据库的脚本和工具。

## 文件说明

- `create-tables.sql`: 在Supabase中创建必要的表和索引的SQL脚本
- `migrate-to-supabase.js`: 将现有JSON数据导入到Supabase的Node.js脚本

## 迁移步骤

### 1. 设置Supabase项目

1. 在[Supabase](https://supabase.com)创建一个新项目
2. 获取项目URL、公共匿名密钥和服务角色密钥
3. 将这些密钥添加到项目根目录的`.env.local`文件中：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. 创建数据库表

有两种方法可以创建必要的表：

#### 方法1：使用SQL编辑器

1. 在Supabase仪表板中打开SQL编辑器
2. 复制并粘贴`create-tables.sql`文件的内容
3. 执行SQL脚本

#### 方法2：使用Supabase CLI

如果您已安装Supabase CLI，可以使用以下命令：

```bash
supabase db push -f ./scripts/create-tables.sql
```

### 3. 运行数据迁移脚本

确保已安装所需的依赖项：

```bash
npm install dotenv @supabase/supabase-js
```

然后运行迁移脚本：

```bash
node ./scripts/migrate-to-supabase.js
```

### 4. 验证迁移

1. 在Supabase仪表板中检查`journals`和`articles`表，确认数据已正确导入
2. 启动应用程序并测试功能是否正常工作

## 注意事项

- 迁移脚本会保留原始文章ID和创建日期
- 如果遇到任何错误，请检查控制台输出以获取详细信息
- 迁移完成后，应用程序将使用Supabase而不是本地JSON文件
- 确保在生产环境中设置适当的行级安全策略(RLS)