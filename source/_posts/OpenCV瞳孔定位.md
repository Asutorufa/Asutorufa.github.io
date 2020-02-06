---
title: OpenCV瞳孔定位
tags:
  - C++
  - OpenCV
  - archlinux
categories:
  - Computer Graphics
abbrlink: 88967b7c
date: 2020-02-06 18:15:35
updated: 2020-02-06 18:15:35
---

## 利用OpenCV自带的分类器识别面部及眼睛

OpenCV自带里许多分类器,可在[haarcascades](https://github.com/opencv/opencv/tree/master/data/haarcascades)下载  

### 获取面部

```c++
// 获取面部
// image 为输入的OpenCV的格式的图像
// out 为输出图像 <- 此处输出图像为裁剪下来的矩形面部图像
bool get_face(cv::Mat image, cv::Mat &out)
{
    // 将图像转为灰度图像,可提高识别精度
    cv::Mat gray;
    cv::cvtColor(image, gray, CV_BGR2GRAY, 0);
    // 此处的rect为用来存储识别出的面部的定位 <- 这里为vector是因为识别的面部可能不止为一个
    std::vector<cv::Rect> rect;
    // 初始化OpenCV的分类器
    cv::CascadeClassifier cas = cv::CascadeClassifier("haarcascade_frontalface_default.xml");
    cas.detectMultiScale(gray, rect, 1.15, 5);
    // 判断rect是否为空,为空的话就是没有被识别的面部
    if (rect.empty())
    {
        return false;
    }
    // 输出图像,这里的rect可能不止为一个(因为可能不止一张脸),所以实际中应该使用for循环
    // 我这里用rect[0]为了简化
    out = image(rect[0]);
    return true;
}
```
<!--more-->
### 获取眼睛

```c++
// 这里与上面相同(这里我只识别左眼,OpenCV还提供了其他文件可获取右眼和双眼)
bool get_left_eye(cv::Mat image, cv::Mat &out)
{
    // 之后与面部相同
    cv::Mat gray;
    cv::cvtColor(image, gray, CV_BGR2GRAY, 0);
    std::vector<cv::Rect> rect;
    cv::CascadeClassifier cas = cv::CascadeClassifier("xml/haarcascade_lefteye_2splits.xml");
    cas.detectMultiScale(gray, rect, 1.15, 5);
    if (rect.empty())
    {
        return false;
    }
    out = image(rect[0]);
    return true;
}
```

## 瞳孔定位

- 获取的眼睛图像
- 裁剪去除眉毛
- 伽马矫正提高图像对比度
- 转化为灰度图像
- 利用threshold进行阈值操作(此处可能会改为inRange,目前还在测试)
- 腐蚀
- 膨胀
- medianBlur平滑图像
- 检测关键点并画在图像上

```c++
// 定位眼球 -> 检测关键点
std::vector<cv::KeyPoint> dector(cv::Mat image)
{
    cv::SimpleBlobDetector::Params detector_params;
    detector_params.filterByArea = true;
    detector_params.maxArea = 1500;
    cv::Ptr<cv::SimpleBlobDetector> blob_dector = cv::SimpleBlobDetector::create(detector_params);
    std::vector<cv::KeyPoint> keypoints;
    blob_dector->detect(image, keypoints);
    return keypoints;
}

bool get_pupil(cv::Mat image, cv::Mat &out)
{
    // width -> image.rows ;
    // height -> image.cols;
    // cut eyebrow 裁剪 去除眉毛
    image = image(cv::Rect(image.cols / 10, image.rows / 2.5, image.cols * 8 / 10, image.rows / 2));

    // Gamma correction/gamma nonlinearity 伽马校正 -> https://www.cnblogs.com/sdu20112013/p/11597171.html
    cv::Mat look_up_table(1, 256, CV_8U);
    uchar *p = look_up_table.ptr();
    float gamma = 0.7;
    for (int i = 0; i < 256; ++i)
        p[i] = cv::saturate_cast<uchar>(pow(i / 255.0, gamma) * 255.0);
    cv::LUT(image, look_up_table, image);

    cv::Mat gray;
    // 转化为灰度图像
    cv::cvtColor(image, gray, CV_BGR2GRAY, 0);
    // 阈值操作
    cv::threshold(gray, gray, inRange_threshold, 255, CV_THRESH_BINARY);
    //膨胀及腐蚀
    cv::erode(gray, gray, cv::Mat(), cv::Point(-1, -1), 2);
    cv::dilate(gray, gray, cv::Mat(), cv::Point(-1, -1), 3);
    // 平滑图像
    cv ::medianBlur(gray, gray, 5);
    // 检测并画出关键点
    cv::drawKeypoints(image, dector(gray), image, cv::Scalar(0, 0, 255), cv::DrawMatchesFlags::DRAW_RICH_KEYPOINTS);
    out = image;
    return true;
}
```

## 附录

### OpenCV在ArchLinux上的使用

```shell
pacman -S opencv
# vtk和hdf5为opencv的依赖,不安装编译会失败
sudo pacman -S vtk
sudo pacman -Ss hdf5
```

### Cmake文件

```cmake
cmake_minimum_required(VERSION 3.14)
project(eyedector)
add_definitions(-std=c++11)
# 这里只需要添加OpenCV的就能编译成功
find_package(OpenCV REQUIRED)
link_libraries(${OpenCV_LIBS})
add_executable(out opencvtest.cpp)
```

### 利用安卓手机充当网络摄像头

手机安装这个[IP Webcam](https://play.google.com/store/apps/details?id=com.pas.webcam),使用时会显示局域网中的地址  

OpenCV中

```c++
cv::VideoCapture cap("http://192.168.0.xx:8080/video"); // 这里为网络摄像头的地址,需要在后面加上/video
while (true)
{
    cv::Mat frame;
    cap >> frame;
    cv::imshow("test", frame);
    if (cv::waitKey(1) == 27)
    {
        exit(0);
    }
}
```
