export const sampleCode = {
  java: `package com.example;

import java.util.ArrayList;
import java.util.List;

public class SampleJava {
    private static final int MAX_COUNT = 100;
    private String message = "Hello, World!";

    public static void main(String[] args) {
        System.out.println("Starting analysis...");
        SampleJava sample = new SampleJava();
        int result = sample.calculateSum(10, 20);
        System.out.println("Sum: " + result);

        for (int i = 0; i < 5; i++) {
            System.out.println("Count: " + i);
            if (i == 3) {
                break;
            }
        }

        boolean flag = true;
        String data = null;
        if (flag && data == null) {
            System.out.println("Conditions met.");
        }

        char grade = 'A';
        double pi = 3.14159;

        System.out.println("Analysis complete.");
    }

    public int calculateSum(int a, int b) {
        int sum = a + b;
        return sum;
    }

    public List<String> getItems() {
      ArrayList<String> items = new ArrayList<>();
      items.add("Apple");
      items.add("Banana");
      return items;
    }
}
`,
  cpp: `#include <iostream>
#include <vector>
#include <string>

namespace SampleNS {
    const double PI = 3.14159;
}

using namespace std;

struct Point {
    int x;
    int y;
};

int add(int a, int b);

int main() {
    cout << "C++ Lexer Sample" << endl;

    int number = 42;
    float value = 12.5f;
    string text = "Sample Text";

    cout << "PI: " << SampleNS::PI << endl;

    int* ptr = &number;
    int& ref = number;
    cout << "Pointer value: " << *ptr << endl;

    if (number > 10 && text.length() > 0) {
        cout << "Condition is true" << endl;
    } else {
        cout << "Condition is false" << endl;
    }

    vector<int> numbers = {1, 2, 3, 4, 5};
    for (int n : numbers) {
        cout << "Vector element: " << n << endl;
    }

    Point p = {10, 20};
    cout << "Point: (" << p.x << ", " << p.y << ")" << endl;

    int sum = add(5, 7);
    cout << "Sum from function: " << sum << endl;

    return 0;
}

int add(int a, int b) {
    return a + b;
}
`,
};
