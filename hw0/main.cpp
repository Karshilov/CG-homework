#include<cmath>
#include<eigen3/Eigen/Core>
#include<eigen3/Eigen/Dense>
#include<iostream>

int main(){
    Eigen::Vector3d pt(2., 1., 1.);
    Eigen::MatrixXd tran(3, 3);
    const double theta = M_PI / 4;
    tran << cos(theta), -sin(theta), 1,
            sin(theta), cos(theta), 2,
            0, 0, 1;
    std::cout << tran * pt << std::endl;
    return 0;
}