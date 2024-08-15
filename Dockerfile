# 使用 Node.js 作为基础镜像
FROM node:20 AS build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 复制源代码
COPY . .

RUN rm -rf /app/node_modules/
RUN rm -rf /app/dist/

# 安装依赖
RUN yarn

# 编译 Vue 应用
RUN yarn build

# 使用 Nginx 作为生产环境服务器
FROM nginx:alpine

# 复制编译后的文件到 Nginx 目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80
