package com.dsavisualizer.service;

import com.dsavisualizer.dto.MethodSignature;
import org.springframework.stereotype.Service;


import java.util.*;
import java.util.stream.Collectors;

@Service
public class CodeWrapperService {

    /**
     * Wraps user code into a complete source for the specified language.
     */
    public String wrapCode(String userCode,
                           String methodName,
                           MethodSignature signature,
                           String language) {
        switch (language.toLowerCase()) {
            case "java":       return wrapJava(userCode, methodName, signature);
            case "python":     return wrapPython(userCode, methodName, signature);
            case "javascript": return wrapJavaScript(userCode, methodName, signature);
            case "cpp":
            case "c++":         return wrapCpp(userCode, methodName, signature);
            default:             return userCode;
        }
    }

    // -------- Java Wrapper --------
    private String wrapJava(String userCode,
                            String methodName,
                            MethodSignature sig) {
        boolean needsTree = sig.getParameters().stream()
                .anyMatch(p -> "TreeNode".equals(p.getType()))
                || "TreeNode".equals(sig.getReturnType());
        boolean needsList = sig.getParameters().stream()
                .anyMatch(p -> "ListNode".equals(p.getType()))
                || "ListNode".equals(sig.getReturnType());
        boolean needsGraph = sig.getParameters().stream()
                .anyMatch(p -> "GraphNode".equals(p.getType()) || p.getType().contains("GraphNode"))
                || (sig.getReturnType() != null && sig.getReturnType().contains("GraphNode"));

// Always import Queue and LinkedList
        String header = String.format("""
                        import java.util.Queue;
                        import java.util.LinkedList;
                        import java.util.Scanner;
                        import java.util.List;
                        import java.util.ArrayList;
                        import java.util.Arrays;
                        import java.util.Stack;
                        import java.util.stream.Collectors;
                        import java.util.Map;
                        import java.util.HashMap;
                        import java.util.HashSet;
                        %s%s%s
                        public class Main {
                        public static void main(String[] args) {
                        try {
                        Scanner sc = new Scanner(System.in);
                        String raw = sc.hasNextLine() ? sc.nextLine().trim() : "";
                        sc.close();
                        if (!raw.startsWith("[")) raw = "[" + raw + "]";
                        raw = raw.replaceAll("\\\\s","");
                        raw = raw.substring(1, raw.length()-1);
                        """,
                needsTree ? "class TreeNode { int val; TreeNode left, right; TreeNode(int v){val=v;} }\n" : "",
                needsList ? "class ListNode { int val; ListNode next; ListNode(int v){val=v;} }\n" : "",
                needsGraph ? "class GraphNode { int val; List<GraphNode> neighbors = new ArrayList<>(); GraphNode(int v){val=v;} }\n" : ""
        );

        String body;
// single-TreeNode case: skip splitting
        if (sig.getParameters().size() == 1 &&
                "TreeNode".equals(sig.getParameters().get(0).getType())) {
            body = String.format("""
                    // single-TreeNode shortcut
                    TreeNode root = toTree(raw);
                    int result = new Solution().%s(root);
                    System.out.println(result);
                    """, methodName);

        } else if (sig.getParameters().size() == 1 &&
                "ListNode".equals(sig.getParameters().get(0).getType())) {
            body = String.format("""
                    // single-ListNode shortcut
                    ListNode head = toList(raw);
                    %s result = new Solution().%s(head);
                    System.out.println(listToString(result));
                    """, sig.getReturnType(), methodName);

        } else if (sig.getParameters().size() == 1 &&
                ("char[][]".equals(sig.getParameters().get(0).getType()) || "Character[][]".equals(sig.getParameters().get(0).getType()))) {
            body = String.format(
                    "// single-char[][] robust shortcut\n" +
                            "char[][] grid; {\n" +
                            "    String s = raw.trim();\n" +
                            "    if (s.startsWith(\"[\")) s = s.substring(1, s.length() - 1);\n" +
                            "    java.util.List<String> rowStrings = new java.util.ArrayList<>();\n" +
                            "    int depth = 0, last = 0;\n" +
                            "    for (int i = 0; i < s.length(); i++) {\n" +
                            "        if (s.charAt(i) == '[') depth++;\n" +
                            "        if (s.charAt(i) == ']') depth--;\n" +
                            "        if (s.charAt(i) == ']' && depth == 0) {\n" +
                            "            rowStrings.add(s.substring(last, i + 1));\n" +
                            "            if (i + 2 < s.length() && s.charAt(i + 1) == ',') last = i + 2;\n" +
                            "        }\n" +
                            "    }\n" +
                            "    grid = new char[rowStrings.size()][];\n" +
                            "    for (int r = 0; r < rowStrings.size(); r++) {\n" +
                            "        String row = rowStrings.get(r).trim();\n" +
                            "        if (row.startsWith(\"[\")) row = row.substring(1, row.length() - 1);\n" +
                            "        String[] cells = row.split(\",\");\n" +
                            "        grid[r] = new char[cells.length];\n" +
                            "        for (int c = 0; c < cells.length; c++) {\n" +
                            "            String cell = cells[c].trim();\n" +
                            "            if (cell.length() >= 2 && cell.startsWith(\"\\\"\") && cell.endsWith(\"\\\"\")) {\n" +
                            "                grid[r][c] = cell.charAt(1);\n" +
                            "            } else {\n" +
                            "                grid[r][c] = cell.charAt(0);\n" +
                            "            }\n" +
                            "        }\n" +
                            "    }\n" +
                            "}\n" +
                            "int result = new Solution().%s(grid);\n" +
                            "System.out.println(result);\n",
                    methodName
            );

        } else {
// general multi-param splitter + parser + call
            StringBuilder paramParsers = new StringBuilder();
            paramParsers.append("""
                    // split top-level args robustly (handles nested arrays)
                    List<String> inputArgs = new ArrayList<>();
                    int bracketDepth = 0, quoteDepth = 0;
                    StringBuilder curr = new StringBuilder();
                    for (int idx = 0; idx < raw.length(); idx++) {
                    char c = raw.charAt(idx);
                    if (c == '"') quoteDepth ^= 1;
                    if (c == '[' && quoteDepth == 0) bracketDepth++;
                    if (c == ']' && quoteDepth == 0) bracketDepth--;
                    if (c == ',' && bracketDepth == 0 && quoteDepth == 0) {
                      inputArgs.add(curr.toString());
                      curr = new StringBuilder();
                    } else {
                      curr.append(c);
                    }
                    }
                    if (curr.length() > 0) inputArgs.add(curr.toString());
                    """);

            for (int i = 0; i < sig.getParameters().size(); i++) {
                var p = sig.getParameters().get(i);
                String name = p.getName(), type = p.getType();
                switch (type) {
                    case "int":
                        paramParsers.append(
                                String.format("                  int %s = Integer.parseInt(inputArgs.get(%d).replaceAll(\"[\\\\[\\\\]]\", \"\"));\n",
                                        name, i));
                        break;
                    case "double":
                    case "float":
                        paramParsers.append(
                                String.format("                  double %s = Double.parseDouble(inputArgs.get(%d).replaceAll(\"[\\\\[\\\\]]\",\"\"));\n",
                                        name, i));
                        break;
                    case "boolean":
                        paramParsers.append(
                                String.format("                  boolean %s = Boolean.parseBoolean(inputArgs.get(%d).replaceAll(\"[\\\\[\\\\]]\",\"\"));\n",
                                        name, i));
                        break;
                    case "String":
                        paramParsers.append(
                                String.format("                  String %s = inputArgs.get(%d).replaceAll(\"^\\\\\\\"|\\\\\\\"$\",\"\");\n",
                                        name, i));
                        break;
                    case "TreeNode":
                        paramParsers.append(
                                String.format("                  TreeNode %s = toTree(inputArgs.get(%d));\n",
                                        name, i));
                        break;
                    case "ListNode":
                        paramParsers.append(
                                String.format("                  ListNode %s = toList(inputArgs.get(%d));\n",
                                        name, i));
                        break;

                    case "int[]":
                    case "List<Integer>":
                    case "List<int>":
                        paramParsers.append(
                                String.format(
                                        "                  int[] %s; { String s = inputArgs.get(%d).replaceAll(\"\\\\[|\\\\]\", \"\"); if (s.isEmpty()) %s = new int[0]; else %s = Arrays.stream(s.split(\",\")).mapToInt(Integer::parseInt).toArray(); }\n",
                                        name, i, name, name
                                )
                        );
                        break;

                    case "String[]":
                    case "List<String>":
                    case "List<string>":
                        paramParsers.append(
                                String.format(
                                        "                  String[] %s; { String s = inputArgs.get(%d).replaceAll(\"\\\\[|\\\\]\", \"\"); if (s.isEmpty()) %s = new String[0]; else %s = s.split(\",\"); }\n",
                                        name, i, name, name
                                )
                        );
                        break;

                    case "char[][]":
                    case "Character[][]":
                        paramParsers.append(
                                String.format(
                                        "                  char[][] %s; { String s = inputArgs.get(%d); if (s.startsWith(\"[[\") && s.endsWith(\"]]\")) { s = s.substring(2, s.length()-2); java.util.List<String> rows = new java.util.ArrayList<>(); int depth = 0; StringBuilder currentRow = new StringBuilder(); for (char c : s.toCharArray()) { if (c == '[') depth++; else if (c == ']') depth--; else if (c == ',' && depth == 0) { rows.add(currentRow.toString()); currentRow.setLength(0); continue; } currentRow.append(c); } if (currentRow.length() > 0) rows.add(currentRow.toString()); %s = new char[rows.size()][]; for (int r = 0; r < rows.size(); r++) { String row = rows.get(r); if (row.startsWith(\"[\") && row.endsWith(\"]\")) row = row.substring(1, row.length()-1); if (row.isEmpty()) { %s[r] = new char[0]; } else { String[] chars = row.split(\",\"); %s[r] = new char[chars.length]; for (int c = 0; c < chars.length; c++) { %s[r][c] = chars[c].trim().charAt(0); } } } } else { %s = new char[0][0]; } }\n",
                                        name, i, name, name, name, name, name
                                )
                        );
                        break;

                    case "int[][]":
                    case "Integer[][]":
                        paramParsers.append(
                                String.format(
                                        "                  int[][] %s; {\n" +
                                                "                      String s = inputArgs.get(%d).trim();\n" +
                                                "                      if (s.equals(\"[]\")) {\n" +
                                                "                          %s = new int[0][];\n" +
                                                "                      } else {\n" +
                                                "                          // Remove outer brackets\n" +
                                                "                          if (s.startsWith(\"[\") && s.endsWith(\"]\")) {\n" +
                                                "                              s = s.substring(1, s.length()-1);\n" +
                                                "                          }\n" +
                                                "                          java.util.List<int[]> rows = new java.util.ArrayList<>();\n" +
                                                "                          int depth = 0;\n" +
                                                "                          StringBuilder currentRow = new StringBuilder();\n" +
                                                "                          for (int idx = 0; idx < s.length(); idx++) {\n" +
                                                "                              char c = s.charAt(idx);\n" +
                                                "                              if (c == '[') {\n" +
                                                "                                  depth++;\n" +
                                                "                                  if (depth == 1) continue; // Skip opening bracket of row\n" +
                                                "                              } else if (c == ']') {\n" +
                                                "                                  depth--;\n" +
                                                "                                  if (depth == 0) {\n" +
                                                "                                      // End of a row\n" +
                                                "                                      String rowStr = currentRow.toString().trim();\n" +
                                                "                                      if (rowStr.isEmpty()) {\n" +
                                                "                                          rows.add(new int[0]);\n" +
                                                "                                      } else {\n" +
                                                "                                          String[] nums = rowStr.split(\",\");\n" +
                                                "                                          int[] row = new int[nums.length];\n" +
                                                "                                          for (int j = 0; j < nums.length; j++) {\n" +
                                                "                                              row[j] = Integer.parseInt(nums[j].trim());\n" +
                                                "                                          }\n" +
                                                "                                          rows.add(row);\n" +
                                                "                                      }\n" +
                                                "                                      currentRow.setLength(0);\n" +
                                                "                                      continue;\n" +
                                                "                                  }\n" +
                                                "                              } else if (c == ',' && depth == 0) {\n" +
                                                "                                  // Skip comma between rows\n" +
                                                "                                  continue;\n" +
                                                "                              }\n" +
                                                "                              if (depth > 0) {\n" +
                                                "                                  currentRow.append(c);\n" +
                                                "                              }\n" +
                                                "                          }\n" +
                                                "                          %s = rows.toArray(new int[0][]);\n" +
                                                "                      }\n" +
                                                "                  }\n",
                                        name, i, name, name
                                )
                        );
                        break;

                    default:
// arrays and others might go here…
                        paramParsers.append(
                                String.format("                  String %s = inputArgs.get(%d);\n",
                                        name, i));
                }
            }

            if (sig.getReturnType().contains("TreeNode")) {
                body = paramParsers.toString() + String.format("                  %s result = new Solution().%s(%s);\n                  System.out.println(result.val);\n",
                        sig.getReturnType(), methodName,
                        sig.getParameters().stream()
                                .map(MethodSignature.Parameter::getName)
                                .collect(Collectors.joining(", "))
                );
            } else if (sig.getReturnType().contains("ListNode")) {
                body = paramParsers.toString() + String.format("                  %s result = new Solution().%s(%s);\n                  System.out.println(listToString(result));\n",
                        sig.getReturnType(), methodName,
                        sig.getParameters().stream()
                                .map(MethodSignature.Parameter::getName)
                                .collect(Collectors.joining(", "))
                );
            } else if (sig.getReturnType().endsWith("[]")) {
                // 1D array (int[], String[], etc.)
                body = paramParsers.toString() + String.format("                  %s result = new Solution().%s(%s);\n                  System.out.println(Arrays.toString(result));\n",
                        sig.getReturnType(), methodName,
                        sig.getParameters().stream()
                                .map(MethodSignature.Parameter::getName)
                                .collect(Collectors.joining(", "))
                );
            } else if (sig.getReturnType().endsWith("[][]")) {
                // 2D array (int[][], String[][], etc.)
                body = paramParsers.toString() + String.format("                  %s result = new Solution().%s(%s);\n                  System.out.println(Arrays.deepToString(result));\n",
                        sig.getReturnType(), methodName,
                        sig.getParameters().stream()
                                .map(MethodSignature.Parameter::getName)
                                .collect(Collectors.joining(", "))
                );
            } else {
                body = paramParsers.toString() + String.format("                  %s result = new Solution().%s(%s);\n                  System.out.println(result);\n",
                        sig.getReturnType(), methodName,
                        sig.getParameters().stream()
                                .map(MethodSignature.Parameter::getName)
                                .collect(Collectors.joining(", "))
                );
            }
        }

// common footer + helpers + user code
        String footer = String.format("""
                        } catch (Exception e) {
                        System.exit(1);
                        }
                        }
                        // helpers below
                        %s
                        %s
                        %s
                        %s
                        } // end of Main class
                        """,
                needsList ? generateJavaListParserHelper() : "",
                needsTree ? generateJavaTreeParserHelper() : "",
                needsList ? generateJavaListSerializer() : "",
                needsGraph ? generateJavaGraphParserHelper() : ""
        );

// Now, append user code (Solution class) after Main
        String addUserCode = userCode + "\n";

        return header + body + footer + addUserCode;
    }

    // ListNode toString helper
    private String generateJavaListSerializer() {
        return "    private static String listToString(ListNode head) {" +
                " StringBuilder sb = new StringBuilder(\"[\");" +
                " for (ListNode c = head; c != null; c = c.next) { sb.append(c.val); if (c.next != null) sb.append(','); }" +
                " return sb.append(\"]\").toString(); }";
    }

    // TreeNode toString helper
    private String generateJavaTreeSerializer() {
        return "    private static String treeToList(TreeNode root) {" +
                " if (root == null) return \"[]\";" +
                " List<String> out = new ArrayList<>();" +
                " Queue<TreeNode> q = new LinkedList<>(); q.add(root);" +
                " while (!q.isEmpty()) { TreeNode n = q.poll(); out.add(n==null?\"null\":String.valueOf(n.val)); if(n!=null){q.add(n.left);q.add(n.right);} }" +
                " int i = out.size()-1; while (i>=0 && out.get(i).equals(\"null\")) i--;" +
                " return out.subList(0, i+1).toString(); }";
    }

    // ListNode parser helper
    private String generateJavaListParserHelper() {
        return "    private static ListNode toList(String s) {" +
                " if (s == null || s.isEmpty()) return null;" +
                " String[] arr = s.replaceAll(\"\\\\[|\\\\]\",\"\").split(\",\");" +
                " ListNode dummy = new ListNode(0), cur = dummy;" +
                " for (String x : arr) if (!x.isEmpty()) { cur.next = new ListNode(Integer.parseInt(x)); cur = cur.next; }" +
                " return dummy.next; }";
    }

    // TreeNode parser helper
    private String generateJavaTreeParserHelper() {
        return "    private static TreeNode toTree(String s) {" +
                " if (s == null || s.isEmpty()) return null;" +
                " s = s.trim();" +
                " if (s.startsWith(\"[\")) s = s.substring(1);" +
                " if (s.endsWith(\"]\")) s = s.substring(0, s.length() - 1);" +
                " if (s.isEmpty()) return null;" +
                " String[] arr = s.split(\",\");" +
                " TreeNode[] nodes = new TreeNode[arr.length];" +
                " for (int i = 0; i < arr.length; i++) {" +
                "     String val = arr[i].trim();" +
                "     if (!val.equals(\"null\")) nodes[i] = new TreeNode(Integer.parseInt(val));" +
                " }" +
                " for (int i = 0; i < arr.length; i++) {" +
                "     if (nodes[i] != null) {" +
                "         int l = 2 * i + 1, r = 2 * i + 2;" +
                "         if (l < arr.length) nodes[i].left = nodes[l];" +
                "         if (r < arr.length) nodes[i].right = nodes[r];" +
                "     }" +
                " }" +
                " return nodes.length > 0 ? nodes[0] : null; }";
    }

    // Add a helper for parsing adjacency list to GraphNode[]
    private String generateJavaGraphParserHelper() {
        return "    // Parses adjacency list (List<List<Integer>>) to array of GraphNode\n" +
               "    private static GraphNode[] toGraph(String s) {\n" +
               "        if (s == null || s.isEmpty()) return new GraphNode[0];\n" +
               "        s = s.replaceAll(\"\\\\[|\\\\]\", \"\");\n" +
               "        if (s.isEmpty()) return new GraphNode[0];\n" +
               "        String[] nodeStrs = s.split(\"],\");\n" +
               "        int n = nodeStrs.length;\n" +
               "        GraphNode[] nodes = new GraphNode[n];\n" +
               "        for (int i = 0; i < n; i++) nodes[i] = new GraphNode(i);\n" +
               "        for (int i = 0; i < n; i++) {\n" +
               "            String[] parts = nodeStrs[i].replaceAll(\"[^0-9,]\", \"\").split(\",\");\n" +
               "            for (String p : parts) {\n" +
               "                if (!p.isEmpty()) {\n" +
               "                    int nei = Integer.parseInt(p);\n" +
               "                    nodes[i].neighbors.add(nodes[nei]);\n" +
               "                }\n" +
               "            }\n" +
               "        }\n" +
               "        return nodes;\n" +
               "    }\n";
    }

    // Helper to join parameter names
    private String generateParamNames(MethodSignature sig) {
        return sig.getParameters().stream()
                .map(MethodSignature.Parameter::getName)
                .collect(Collectors.joining(", "));
    }

    // -------- Python Wrapper --------
    private String wrapPython(String userCode, String methodName, MethodSignature sig) {
        StringBuilder sb = new StringBuilder();
        boolean needsListImport = userCode.contains("List") || sig.getParameters().stream().anyMatch(p -> p.getType().contains("List"));
        boolean needsTree = sig.getParameters().stream().anyMatch(p -> p.getType().contains("TreeNode")) || sig.getReturnType().contains("TreeNode");
        boolean needsListNode = sig.getParameters().stream().anyMatch(p -> p.getType().contains("ListNode")) || sig.getReturnType().contains("ListNode");
        boolean needsGraph = sig.getParameters().stream().anyMatch(p -> p.getType().contains("GraphNode")) || sig.getReturnType().contains("GraphNode");
        if (needsListImport) {
            sb.append("from typing import List\n");
        }
        sb.append("import sys, json\n");
        if (needsTree) {
            sb.append("class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\n");
            sb.append("def array_to_tree(arr):\n    if not arr: return None\n    nodes = [TreeNode(x) if x is not None else None for x in arr]\n    kids = nodes[::-1]\n    root = kids.pop()\n    for node in nodes:\n        if node:\n            if kids: node.left = kids.pop()\n            if kids: node.right = kids.pop()\n    return root\n\n");
            sb.append("def tree_to_array(root):\n    if not root: return []\n    res, queue = [], [root]\n    while queue:\n        node = queue.pop(0)\n        if node:\n            res.append(node.val)\n            queue.append(node.left)\n            queue.append(node.right)\n        else:\n            res.append(None)\n    while res and res[-1] is None: res.pop()\n    return res\n\n");
        }
        if (needsListNode) {
            sb.append("class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n");
            sb.append("def array_to_list(arr):\n    dummy = ListNode(0)\n    curr = dummy\n    for x in arr:\n        curr.next = ListNode(x)\n        curr = curr.next\n    return dummy.next\n\n");
            sb.append("def list_to_array(head):\n    res = []\n    while head:\n        res.append(head.val)\n        head = head.next\n    return res\n\n");
        }
        if (needsGraph) {
            sb.append("class GraphNode:\n    def __init__(self, val):\n        self.val = val\n        self.neighbors = []\n\n");
            sb.append("def adjlist_to_graph(adj):\n    nodes = [GraphNode(i) for i in range(len(adj))]\n    for i, nbrs in enumerate(adj):\n        for j in nbrs:\n            nodes[i].neighbors.append(nodes[j])\n    return nodes\n\n");
        }
        sb.append(userCode).append("\n");
        sb.append("def main():\n");
        sb.append("    try:\n");
        sb.append("        data=sys.stdin.read().strip()\n");
        sb.append("        args=[] if not data or data=='[]' else json.loads(data)\n");
        for (int i = 0; i < sig.getParameters().size(); i++) {
            var p = sig.getParameters().get(i);
            String name = p.getName();
            String type = p.getType();
            String assign;
            if (type.contains("TreeNode")) {
                assign = String.format("        %s = array_to_tree(args[%d]) if isinstance(args[%d], list) else TreeNode(args[%d])\n", name, i, i, i);
            } else if (type.contains("ListNode")) {
                assign = String.format("        %s = array_to_list(args[%d])\n", name, i);
            } else if (type.contains("GraphNode")) {
                assign = String.format("        %s = adjlist_to_graph(args[%d])\n", name, i);
            } else if (type.equals("int")) {
                assign = String.format("        %s = int(args[%d])\n", name, i);
            } else if (type.equals("float") || type.equals("double")) {
                assign = String.format("        %s = float(args[%d])\n", name, i);
            } else if (type.equals("bool") || type.equals("boolean")) {
                assign = String.format("        %s = bool(args[%d])\n", name, i);
            } else if (type.equals("str") || type.equals("String")) {
                assign = String.format("        %s = str(args[%d])\n", name, i);
            } else if (type.equals("List[int]") || type.equals("int[]")) {
                assign = String.format("        %s = list(map(int, args[%d]))\n", name, i);
            } else if (type.equals("List[str]") || type.equals("string[]")) {
                assign = String.format("        %s = list(map(str, args[%d]))\n", name, i);
            } else if (type.equals("List[List[str]]") || type.equals("char[][]") || type.equals("Character[][]")) {
                assign = String.format("        %s = args[%d]\n", name, i);
            } else if (type.equals("List[List[int]]") || type.equals("int[][]") || type.equals("Integer[][]")) {
                assign = String.format("        %s = args[%d]\n", name, i);
            } else {
                assign = String.format("        %s = args[%d]\n", name, i);
            }
            sb.append(assign);
        }
        sb.append("        sol = Solution()\n");
        sb.append(String.format("        res = sol.%s(%s)\n", methodName, generateParamNames(sig)));
        if (sig.getReturnType().contains("TreeNode")) {
            sb.append("        print(res.val)\n");
        } else if (sig.getReturnType().contains("ListNode")) {
            sb.append("        print(json.dumps(list_to_array(res)))\n");
        } else if (sig.getReturnType().contains("GraphNode")) {
            sb.append("        print(len(res)) # or print node values as needed\n");
        } else if (sig.getReturnType().equals("bool") || sig.getReturnType().equals("boolean")) {
            sb.append("        print(\"True\" if res else \"False\")\n");
        } else {
            sb.append("        print(json.dumps(res))\n");
        }
        sb.append("    except Exception as e:\n");
        sb.append("        print()\n");
        sb.append("if __name__=='__main__': main()\n");
        String generatedCode = sb.toString();
        return generatedCode;
    }

    // -------- JavaScript Wrapper --------
    private String wrapJavaScript(String userCode, String methodName, MethodSignature sig) {
        StringBuilder sb = new StringBuilder();
        sb.append("const fs = require('fs');\n");
        sb.append("let data = fs.readFileSync(0, 'utf-8').trim();\n");
        sb.append("let args = []; try { args = data && data!='[]'?JSON.parse(data):[]; } catch(e) { return; }\n");

        boolean needsTree = sig.getParameters().stream().anyMatch(p -> p.getType().contains("TreeNode")) || sig.getReturnType().contains("TreeNode");
        boolean needsListNode = sig.getParameters().stream().anyMatch(p -> p.getType().contains("ListNode")) || sig.getReturnType().contains("ListNode");
        boolean needsGraph = sig.getParameters().stream().anyMatch(p -> p.getType().contains("GraphNode")) || sig.getReturnType().contains("GraphNode");
        if (needsTree) {
            sb.append("class TreeNode {\n  constructor(val=0, left=null, right=null) { this.val=val; this.left=left; this.right=right; }\n}\n");
            sb.append("function arrayToTree(arr) {\n  if (!arr || !arr.length) return null;\n  let nodes = arr.map(x => x===null ? null : new TreeNode(x));\n  let kids = nodes.slice(1);\n  for (let i=0, j=1; j<nodes.length; ++i) {\n    if (nodes[i]) {\n      if (j < nodes.length) nodes[i].left = nodes[j++];\n      if (j < nodes.length) nodes[i].right = nodes[j++];\n    }\n  }\n  return nodes[0];\n}\n");
            sb.append("function treeToArray(root) {\n  if (!root) return [];\n  let res = [], queue = [root];\n  while (queue.length) {\n    let node = queue.shift();\n    if (node) {\n      res.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    } else {\n      res.push(null);\n    }\n  }\n  while (res.length && res[res.length-1] === null) res.pop();\n  return res;\n}\n");
        }
        if (needsListNode) {
            sb.append("class ListNode {\n  constructor(val=0, next=null) { this.val=val; this.next=next; }\n}\n");
            sb.append("function arrayToList(arr) {\n  let dummy = new ListNode(0), curr = dummy;\n  for (let x of arr) { curr.next = new ListNode(x); curr = curr.next; }\n  return dummy.next;\n}\n");
            sb.append("function listToArray(head) {\n  let res = [];\n  while (head) { res.push(head.val); head = head.next; }\n  return res;\n}\n");
        }
        if (needsGraph) {
            sb.append("class GraphNode {\n  constructor(val) { this.val = val; this.neighbors = []; }\n}\n");
            sb.append("function adjlistToGraph(adj) {\n  const nodes = Array.from({length: adj.length}, (_, i) => new GraphNode(i));\n  for (let i = 0; i < adj.length; i++) {\n    for (const j of adj[i]) {\n      nodes[i].neighbors.push(nodes[j]);\n    }\n  }\n  return nodes;\n}\n");
        }
        // Always inject Queue class for JS
        sb.append("class Queue {\n  constructor() { this._arr = []; }\n  enqueue(x) { this._arr.push(x); }\n  dequeue() { return this._arr.shift(); }\n  isEmpty() { return this._arr.length === 0; }\n  size() { return this._arr.length; }\n  push(x) { this.enqueue(x); }\n  pop() { return this.dequeue(); }\n}\n");
        for (int i = 0; i < sig.getParameters().size(); i++) {
            var p = sig.getParameters().get(i);
            String name = p.getName();
            String type = p.getType();
            String assign;
            if (type.equals("int") || type.equals("Integer")) {
                assign = String.format("const %s = Number(args[%d]);\n", name, i);
            } else if (type.equals("float") || type.equals("double")) {
                assign = String.format("const %s = Number(args[%d]);\n", name, i);
            } else if (type.equals("boolean") || type.equals("bool")) {
                assign = String.format("const %s = Boolean(args[%d]);\n", name, i);
            } else if (type.equals("string") || type.equals("String")) {
                assign = String.format("const %s = String(args[%d]);\n", name, i);
            } else if (type.equals("int[]") || type.equals("List<int>") || type.equals("List<Integer>")) {
                assign = String.format("const %s = args[%d].map(Number);\n", name, i);
            } else if (type.equals("string[]") || type.equals("List<string>") || type.equals("List<String>")) {
                assign = String.format("const %s = args[%d].map(String);\n", name, i);
            } else if (type.equals("vector<vector<char>>") || type.equals("char[][]") || type.equals("Character[][]") || type.equals("List<List<string>>")) {
                assign = String.format("const %s = args[%d];\n", name, i);
            } else if (type.equals("vector<vector<int>>") || type.equals("int[][]") || type.equals("Integer[][]") || type.equals("List<List<int>>")) {
                assign = String.format("const %s = args[%d];\n", name, i);
            } else if (type.contains("TreeNode")) {
                assign = String.format("const %s = Array.isArray(args[%d]) ? arrayToTree(args[%d]) : new TreeNode(args[%d]);\n", name, i, i, i);
            } else if (type.contains("ListNode")) {
                assign = String.format("const %s = arrayToList(args[%d]);\n", name, i);
            } else if (type.contains("GraphNode")) {
                assign = String.format("const %s = adjlistToGraph(args[%d]);\n", name, i);
            } else {
                assign = String.format("const %s = args[%d];\n", name, i);
            }
            sb.append(assign);
        }
        sb.append(userCode).append("\n");
        sb.append(String.format("const sol = new Solution();\nconst res = sol.%s(%s);\n",
            methodName, generateParamNames(sig)));
        if (sig.getReturnType().contains("TreeNode")) {
            sb.append("console.log(res.val);\n");
        } else if (sig.getReturnType().contains("ListNode")) {
            sb.append("console.log(JSON.stringify(listToArray(res)));\n");
        } else if (sig.getReturnType().contains("GraphNode")) {
            sb.append("console.log(res.length); // or print node values as needed\n");
        } else {
            sb.append("console.log(JSON.stringify(res));\n");
        }
        String generatedCode = sb.toString();
        return generatedCode;
    }

    // -------- C++ Wrapper --------
    private String wrapCpp(String userCode, String methodName, MethodSignature sig) {
        StringBuilder sb = new StringBuilder();
        sb.append("// judge0: -std=c++14\n");
        sb.append("#include <bits/stdc++.h>\n");
        sb.append("#include <queue>\n");
        sb.append("#include <stack>\n");
        sb.append("#include <vector>\n");
        sb.append("#include <map>\n");
        sb.append("#include <unordered_map>\n");
        sb.append("using namespace std;\n\n");

        boolean needsTree = sig.getParameters().stream().anyMatch(p -> p.getType().contains("TreeNode")) || sig.getReturnType().contains("TreeNode");
        boolean needsListNode = sig.getParameters().stream().anyMatch(p -> p.getType().contains("ListNode")) || sig.getReturnType().contains("ListNode");
        boolean needsGraph = sig.getParameters().stream().anyMatch(p -> p.getType().contains("GraphNode")) || sig.getReturnType().contains("GraphNode");

        if (needsTree) {
            sb.append("struct TreeNode { int val; TreeNode *left, *right; TreeNode(int v): val(v), left(nullptr), right(nullptr) {} };\n");
            sb.append("TreeNode* arrayToTree(const std::vector<std::string>& arr) {\n  if (arr.empty() || arr[0] == \"null\") return nullptr;\n  std::vector<TreeNode*> nodes(arr.size(), nullptr);\n  for (size_t i = 0; i < arr.size(); ++i)\n    if (arr[i] != \"null\") nodes[i] = new TreeNode(std::stoi(arr[i]));\n  for (size_t i = 0, j = 1; j < arr.size(); ++i) {\n    if (nodes[i]) {\n      if (j < arr.size()) nodes[i]->left = nodes[j++];\n      if (j < arr.size()) nodes[i]->right = nodes[j++];\n    }\n  }\n  return nodes[0];\n}\n");
            sb.append("std::vector<std::string> treeToArray(TreeNode* root) {\n  std::vector<std::string> res;\n  if (!root) return res;\n  std::queue<TreeNode*> q; q.push(root);\n  while (!q.empty()) {\n    TreeNode* node = q.front(); q.pop();\n    if (node) { res.push_back(std::to_string(node->val)); q.push(node->left); q.push(node->right); }\n    else res.push_back(\"null\");\n  }\n  while (!res.empty() && res.back() == \"null\") res.pop_back();\n  return res;\n}\n");
        }
        if (needsListNode) {
            sb.append("struct ListNode { int val; ListNode *next; ListNode(int v): val(v), next(nullptr) {} };\n");
            sb.append("ListNode* arrayToList(const std::vector<int>& arr) {\n  ListNode dummy(0), *cur = &dummy;\n  for (int x : arr) { cur->next = new ListNode(x); cur = cur->next; }\n  return dummy.next;\n}\n");
            sb.append("std::vector<int> listToArray(ListNode* head) {\n  std::vector<int> res;\n  while (head) { res.push_back(head->val); head = head->next; }\n  return res;\n}\n");
        }
        if (needsGraph) {
            sb.append("struct GraphNode { int val; vector<GraphNode*> neighbors; GraphNode(int v): val(v) {} };\n");
            sb.append("vector<GraphNode*> adjlistToGraph(const vector<vector<int>>& adj) {\n  vector<GraphNode*> nodes;\n  for (int i = 0; i < adj.size(); ++i) nodes.push_back(new GraphNode(i));\n  for (int i = 0; i < adj.size(); ++i)\n    for (int j : adj[i]) nodes[i]->neighbors.push_back(nodes[j]);\n  return nodes;\n}\n");
        }

        // First emit user's Solution class definition
        sb.append(userCode).append("\n\n");

        // Helper to split top level args
        sb.append("vector<string> splitTopLevelArgs(const string& raw) {\n");
        sb.append("    vector<string> args; int depth=0; string curr;\n");
        sb.append("    for(char c:raw){ if(c=='[')depth++; if(c==']')depth--; if(c==','&&depth==0){args.push_back(curr);curr.clear();}else curr+=c;}\n");
        sb.append("    if(!curr.empty()) args.push_back(curr);\n    return args;\n}\n\n");

        // Main function
        sb.append("int main() {\n");
        sb.append("    try {\n");
        sb.append("        string raw;\n");
        sb.append("        if (!getline(cin, raw)) { return 1; }\n");
        sb.append("        raw.erase(remove(raw.begin(), raw.end(), ' '), raw.end());\n");

        if (sig.getParameters().size() == 1 && sig.getParameters().get(0).getType().contains("TreeNode")) {
            // Single TreeNode input: do not split, just parse raw
            sb.append("        string s = raw;\n");
            sb.append("        if(s.size()>=2 && s.front()=='[' && s.back()==']') s = s.substr(1, s.size()-2);\n");
            sb.append("        vector<string> arr;\n");
            sb.append("        if(!s.empty()) { stringstream ss(s); string item; while(getline(ss, item, ',')) arr.push_back(item); }\n");
            sb.append("        TreeNode* root = arrayToTree(arr);\n");
            sb.append(String.format("        Solution sol; auto res = sol.%s(root);\n", methodName));
            String retType = sig.getReturnType();
            if (retType.contains("TreeNode")) {
                sb.append("        if (res) cout << res->val << endl;\n");
            } else if (retType.contains("ListNode")) {
                sb.append("        vector<int> out = listToArray(res);\n");
                sb.append("        cout << '[';");
                sb.append(" for (size_t i = 0; i < out.size(); ++i) { cout << out[i]; if (i+1 < out.size()) cout << ','; }");
                sb.append(" cout << ']' << endl;\n");
            } else if (retType.equals("bool") || retType.equals("boolean")) {
                sb.append("        cout << (res ? \"true\" : \"false\") << endl;\n");
            } else {
                sb.append("        cout << res << endl;\n");
            }
            sb.append("        return 0;\n");
            sb.append("    } catch (exception &e) {\n");
            sb.append("        return 1;\n");
            sb.append("    }\n");
            sb.append("}\n");
            return sb.toString();
        } else if (sig.getParameters().size() == 1 && sig.getParameters().get(0).getType().contains("ListNode")) {
            // Single ListNode input: do not split, just parse raw
            sb.append("        string s = raw;\n");
            sb.append("        if(s.size()>=2 && s.front()=='[' && s.back()==']') s = s.substr(1, s.size()-2);\n");
            sb.append("        vector<int> arr;\n");
            sb.append("        if(!s.empty()) { stringstream ss(s); string item; while(getline(ss, item, ',')) if(!item.empty()) arr.push_back(stoi(item)); }\n");
            sb.append("        ListNode* head = arrayToList(arr);\n");
            sb.append(String.format("        Solution sol; auto res = sol.%s(head);\n", methodName));
            sb.append("        vector<int> out = listToArray(res);\n");
            sb.append("        cout << '[';");
            sb.append(" for (size_t i = 0; i < out.size(); ++i) { cout << out[i]; if (i+1 < out.size()) cout << ','; }");
            sb.append(" cout << ']' << endl;\n");
            sb.append("        return 0;\n");
            sb.append("    } catch (exception &e) {\n");
            sb.append("        return 1;\n");
            sb.append("    }\n");
            sb.append("}\n");
            return sb.toString();
        }

        // Multi-parameter parsing
        sb.append("        vector<string> args;\n");
        sb.append("        if (raw.size() >= 2 && raw.front() == '\"' && raw.back() == '\"') {\n");
        sb.append("            args.push_back(raw.substr(1, raw.size() - 2));\n");
        sb.append("        } else if (raw.size() >= 2 && raw.front() == '[' && raw.back() == ']') {\n");
        sb.append("            raw = raw.substr(1, raw.size() - 2);\n");
        sb.append("            args = splitTopLevelArgs(raw);\n");
        sb.append("        } else if (!raw.empty()) {\n");
        sb.append("            args.push_back(raw);\n");
        sb.append("        }\n");

        // Emit parsing for each param
        for (int i = 0; i < sig.getParameters().size(); i++) {
            var p = sig.getParameters().get(i);
            String name = p.getName();
            String type = p.getType();
            String assign;
            if (type.contains("TreeNode")) {
                assign = String.format("        vector<string> arr%d; { string s = args[%d]; if(s.size()>=2 && s.front()=='[' && s.back()==']') s = s.substr(1, s.size()-2); if(!s.empty()) { stringstream ss(s); string item; while(getline(ss, item, ',')) arr%d.push_back(item); } } TreeNode* %s = arrayToTree(arr%d);\n",
                        i, i, i, name, i);
            } else if (type.equals("int")) {
                assign = String.format("        int %s = stoi(args[%d]);\n", name, i);
            } else if (type.equals("double") || type.equals("float")) {
                assign = String.format("        double %s = stod(args[%d]);\n", name, i);
            } else if (type.equals("bool") || type.equals("boolean")) {
                assign = String.format("        bool %s = (args[%d] == \"true\");\n", name, i);
            } else if (type.equals("string") || type.equals("String")) {
                assign = String.format("        string %s = args[%d]; if (%s.front() == '\"') %s = %s.substr(1, %s.size()-2);\n", name, i, name, name, name, name);
            } else if (type.equals("vector<int>") || type.equals("int[]") || type.equals("List<int>") || type.equals("List<Integer>")) {
                assign = String.format("        vector<int> %s; { string s = args[%d]; if(s.size()>=2 && s.front()=='[' && s.back()==']') s = s.substr(1, s.size()-2); stringstream ss(s); string item; while(getline(ss, item, ',')) if(!item.empty()) %s.push_back(stoi(item)); }\n", name, i, name);
            } else if (type.equals("vector<string>") || type.equals("string[]") || type.equals("List<string>") || type.equals("List<String>")) {
                assign = String.format("        vector<string> %s; { string s = args[%d]; if(s.size()>=2 && s.front()=='[' && s.back()==']') s = s.substr(1, s.size()-2); stringstream ss(s); string item; while(getline(ss, item, ',')) if(!item.empty()) %s.push_back(item); }\n", name, i, name);
            } else if (type.equals("vector<vector<char>>") || type.equals("char[][]") || type.equals("Character[][]")) {
                assign = String.format(
                        "        vector<vector<char>> %s; {\n" +
                                "            string s = args[%d];\n" +
                                "            s.erase(0, s.find_first_not_of(\" \\n\\r\\t\"));\n" +
                                "            s.erase(s.find_last_not_of(\" \\n\\r\\t\") + 1);\n" +
                                "            if(s.size()>=4 && s.substr(0,2)==\"[[\" && s.substr(s.size()-2)==\"]]\") {\n" +
                                "                s = s.substr(2, s.size()-4); // Remove outer [[ and ]]\n" +
                                "                vector<string> rows;\n" +
                                "                size_t start = 0;\n" +
                                "                while(start < s.size()) {\n" +
                                "                    size_t end = s.find(\"],[\", start);\n" +
                                "                    if(end == string::npos) {\n" +
                                "                        rows.push_back(s.substr(start));\n" +
                                "                        break;\n" +
                                "                    }\n" +
                                "                    rows.push_back(s.substr(start, end - start));\n" +
                                "                    start = end + 3; // Skip past \",[\"\n" +
                                "                }\n" +
                                "                for(const string& row : rows) {\n" +
                                "                    vector<char> rowVec;\n" +
                                "                    string rowStr = row;\n" +
                                "                    // Remove leading/trailing quotes and brackets if present\n" +
                                "                    if(rowStr.size() >= 2 && rowStr.front() == '[' && rowStr.back() == ']') {\n" +
                                "                        rowStr = rowStr.substr(1, rowStr.size()-2);\n" +
                                "                    }\n" +
                                "                    stringstream ss(rowStr);\n" +
                                "                    string item;\n" +
                                "                    while(getline(ss, item, ',')) {\n" +
                                "                        // Remove quotes from individual characters\n" +
                                "                        if(item.size() >= 2 && item.front() == '\"' && item.back() == '\"') {\n" +
                                "                            rowVec.push_back(item[1]);\n" +
                                "                        } else if(!item.empty()) {\n" +
                                "                            rowVec.push_back(item[0]);\n" +
                                "                        }\n" +
                                "                    }\n" +
                                "                    %s.push_back(rowVec);\n" +
                                "                }\n" +
                                "            }\n" +
                                "        }\n",
                        name, i, name);
            } else if (type.equals("vector<vector<int>>")
                    || type.equals("int[][]")
                    || type.equals("Integer[][]")) {
                assign = String.format(
                        "        vector<vector<int>> %s; {\n" +
                                "            string s = args[%d];\n" +
                                "            // strip only the outermost brackets\n" +
                                "            if (s.size() >= 2 && s.front()=='[' && s.back()==']') {\n" +
                                "                string inner = s.substr(1, s.size()-2);\n" +
                                "                auto rows = splitTopLevelArgs(inner);\n" +
                                "                for (auto &row : rows) {\n" +
                                "                    // strip each row's own [ ]\n" +
                                "                    if (row.size() >= 2 && row.front()=='[' && row.back()==']')\n" +
                                "                        row = row.substr(1, row.size()-2);\n" +
                                "                    vector<int> rowVec;\n" +
                                "                    stringstream ss(row);\n" +
                                "                    string item;\n" +
                                "                    while (getline(ss, item, ','))\n" +
                                "                        if (!item.empty()) rowVec.push_back(stoi(item));\n" +
                                "                    %s.push_back(rowVec);\n" +
                                "                }\n" +
                                "            }\n" +
                                "        }\n",
                        name, i, name
                );
            } else if (type.contains("ListNode")) {
                assign = String.format("        vector<int> arr%d; { string s = args[%d]; if(s.size()>=2 && s.front()=='[' && s.back()==']') s = s.substr(1, s.size()-2); if(!s.empty()) { stringstream ss(s); string item; while(getline(ss, item, ',')) if(!item.empty()) arr%d.push_back(stoi(item)); } } ListNode* %s = arrayToList(arr%d);\n", i, i, i, name, i);
            } else {
                assign = String.format("        string %s = args[%d];\n", name, i);
            }
            sb.append(assign);
        }

        sb.append("        Solution sol;\n");
        sb.append(String.format("        auto res = sol.%s(%s);\n", methodName, generateParamNames(sig)));

        // Output based on return type
        String retType = sig.getReturnType();
        if (retType.contains("TreeNode")) {
            sb.append("        if (res) cout << res->val << endl;\n");
        } else if (retType.contains("ListNode")) {
            sb.append("        vector<int> out = listToArray(res);\n");
            sb.append("        cout << '[';");
            sb.append(" for (size_t i = 0; i < out.size(); ++i) { cout << out[i]; if (i+1 < out.size()) cout << ','; }");
            sb.append(" cout << ']' << endl;\n");
        } else if (retType.equals("vector<int>") || retType.equals("int[]") || retType.equals("List<int>") || retType.equals("List<Integer>")) {
            sb.append("        cout << '[';");
            sb.append(" for (size_t i = 0; i < res.size(); ++i) { cout << res[i]; if (i+1 < res.size()) cout << ','; }");
            sb.append(" cout << ']' << endl;\n");
        } else if (retType.equals("vector<string>") || retType.equals("string[]") || retType.equals("List<string>") || retType.equals("List<String>")) {
            sb.append("        cout << '[';");
            sb.append(" for (size_t i = 0; i < res.size(); ++i) { cout << '\"' << res[i] << '\"'; if (i+1 < res.size()) cout << ','; }");
            sb.append(" cout << ']' << endl;\n");
        } else if (retType.equals("vector<vector<int>>") || retType.equals("int[][]") || retType.equals("Integer[][]")) {
            sb.append("        cout << '[';");
            sb.append(" for (size_t i = 0; i < res.size(); ++i) {");
            sb.append(" cout << '[';");
            sb.append(" for (size_t j = 0; j < res[i].size(); ++j) { cout << res[i][j]; if (j+1 < res[i].size()) cout << ','; }");
            sb.append(" cout << ']'; if (i+1 < res.size()) cout << ','; }");
            sb.append(" cout << ']' << endl;\n");
        } else if (retType.equals("vector<vector<string>>") || retType.equals("string[][]") || retType.equals("List<List<string>>") || retType.equals("List<List<String>>")) {
            sb.append("        cout << '[';");
            sb.append(" for (size_t i = 0; i < res.size(); ++i) {");
            sb.append(" cout << '[';");
            sb.append(" for (size_t j = 0; j < res[i].size(); ++j) { cout << '\"' << res[i][j] << '\"'; if (j+1 < res[i].size()) cout << ','; }");
            sb.append(" cout << ']'; if (i+1 < res.size()) cout << ','; }");
            sb.append(" cout << ']' << endl;\n");
        } else if (retType.equals("bool") || retType.equals("boolean")) {
            sb.append("        cout << (res ? \"true\" : \"false\") << endl;\n");
        } else {
            sb.append("        cout << res << endl;\n");
        }

        sb.append("        return 0;\n");
        sb.append("    } catch (exception &e) {\n");
        sb.append("        return 1;\n");
        sb.append("    }\n");
        sb.append("}\n");

        String generatedCode = sb.toString();
        return generatedCode;
    }
}
