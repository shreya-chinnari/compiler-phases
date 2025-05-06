export const sampleCode = {
  java: `/**
 * Sample Java class to demonstrate the lexer.
 */
package com.example;

import java.util.ArrayList;
import java.util.List;

public class SampleJava {
    private static final int MAX_COUNT = 100; // Max items
    private String message = "Hello, World!"; // Greeting message

    public static void main(String[] args) {
        System.out.println("Starting analysis...");
        SampleJava sample = new SampleJava();
        int result = sample.calculateSum(10, 20);
        System.out.println("Sum: " + result);

        // Example of a loop
        for (int i = 0; i < 5; i++) {
            System.out.println("Count: " + i);
            if (i == 3) {
                break; // Exit loop early
            }
        }

        // Check boolean and null
        boolean flag = true;
        String data = null;
        if (flag && data == null) {
            System.out.println("Conditions met.");
        }

        char grade = 'A'; // Character literal
        double pi = 3.14159;

        System.out.println("Analysis complete.");
    }

    /**
     * Calculates the sum of two integers.
     * @param a First integer
     * @param b Second integer
     * @return The sum
     */
    public int calculateSum(int a, int b) {
        int sum = a + b;
        // An invalid token example: $invalid_char
        return sum;
    }

    // Method with list
    public List<String> getItems() {
      ArrayList<String> items = new ArrayList<>();
      items.add("Apple");
      items.add("Banana");
      return items;
    }
}
/* Multi-line
   comment example */
`,
  cpp: `/*
 * Sample C++ code for the lexer.
 */
#include <iostream>
#include <vector>
#include <string>

// Define a namespace
namespace SampleNS {
    const double PI = 3.14159;
}

// Using namespace std for convenience
using namespace std;

// A simple struct
struct Point {
    int x;
    int y;
};

// Function declaration
int add(int a, int b);

int main() {
    cout << "C++ Lexer Sample" << endl;

    int number = 42;
    float value = 12.5f;
    string text = "Sample Text";

    // Using the namespace
    cout << "PI: " << SampleNS::PI << endl;

    // Pointers and references
    int* ptr = &number;
    int& ref = number;
    cout << "Pointer value: " << *ptr << endl;

    // Conditional statement
    if (number > 10 && text.length() > 0) {
        cout << "Condition is true" << endl;
    } else {
        cout << "Condition is false" << endl;
    }

    // Range-based for loop
    vector<int> numbers = {1, 2, 3, 4, 5};
    for (int n : numbers) {
        cout << "Vector element: " << n << endl;
    }

    // Using the struct
    Point p = {10, 20};
    cout << "Point: (" << p.x << ", " << p.y << ")" << endl;

    // Function call
    int sum = add(5, 7);
    cout << "Sum from function: " << sum << endl;

    // Invalid token example: @invalidSymbol

    return 0; // Indicate successful execution
}

// Function definition
int add(int a, int b) {
    // This is a single-line comment
    return a + b;
}

/*
 * Another multi-line comment.
 * It spans multiple lines.
 */
`,
};
