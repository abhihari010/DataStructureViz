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

        // Common header (imports + optional class defs)
        String header = String.format("""
        import java.util.Scanner;
        import java.util.List;
        import java.util.ArrayList;
        import java.util.Arrays;
        import java.util.Queue;
        import java.util.LinkedList;
        import java.util.Stack;
        import java.util.stream.Collectors;
        %s%s
        public class Main {
            public static void main(String[] args) {
                try {
                Scanner sc = new Scanner(System.in);
                String raw = sc.hasNextLine() ? sc.nextLine().trim() : "";
                sc.close();
                // wrap non-array inputs
                if (!raw.startsWith("[")) raw = "[" + raw + "]";
                // strip outer [ ]
                raw = raw.replaceAll("\\\\s",""); 
                raw = raw.substring(1, raw.length()-1);
        """,
                needsTree ? "class TreeNode { int val; TreeNode left, right; TreeNode(int v){val=v;} }\n" : "",
                needsList ? "class ListNode { int val; ListNode next; ListNode(int v){val=v;} }\n" : ""
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

        } else {
            // general multi-param splitter + parser + call
            StringBuilder paramParsers = new StringBuilder();
            paramParsers.append("""
                  // split top-level args
                  List<String> inputArgs = new ArrayList<>();
                  int bracketDepth = 0, quoteDepth = 0;
                  StringBuilder curr = new StringBuilder();
                  for (char c : raw.toCharArray()) {
                      if (c=='"') quoteDepth ^= 1;
                      if (c=='[' && quoteDepth==0) bracketDepth++;
                      if (c==']' && quoteDepth==0) bracketDepth--;
                      if (c==',' && bracketDepth==0 && quoteDepth==0) {
                          inputArgs.add(curr.toString());
                          curr = new StringBuilder();
                      } else {
                          curr.append(c);
                      }
                  }
                  if (curr.length()>0) inputArgs.add(curr.toString());
        """);

            for (int i = 0; i < sig.getParameters().size(); i++) {
                var p = sig.getParameters().get(i);
                String name = p.getName(), type = p.getType();
                paramParsers.append(String.format("                  System.err.println(\"DEBUG: inputArgs.get(%d) = \" + inputArgs.get(%d));\n", i, i));
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
                                        "                  int[] %s; { String s = inputArgs.get(%d).replaceAll(\"[\\\\[\\\\]]\", \"\"); if (s.isEmpty()) %s = new int[0]; else %s = Arrays.stream(s.split(\",\")).mapToInt(Integer::parseInt).toArray(); }\n",
                                        name, i, name, name
                                )
                        );
                        break;

                    case "String[]":
                    case "List<String>":
                    case "List<string>":
                        paramParsers.append(
                                String.format(
                                        "                  String[] %s; { String s = inputArgs.get(%d).replaceAll(\"[\\\\[\\\\]]\", \"\"); if (s.isEmpty()) %s = new String[0]; else %s = s.split(\",\"); }\n",
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
                System.err.println("ERROR: " + e.getMessage());
                System.exit(1);
            }
        }
        // helpers below
%s
%s
%s
} // end of Main class
""",
            needsList    ? generateJavaListParserHelper() : "",
            needsTree    ? generateJavaTreeParserHelper() : "",
            needsList    ? generateJavaListSerializer() : ""
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
                " String[] arr = s.replaceAll(\"[\\\\[\\\\]]\",\"\").split(\",\");" +
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
            } else {
                assign = String.format("        %s = args[%d]\n", name, i);
            }
            sb.append(assign);
        }
        sb.append("        sol = Solution()\n");
        sb.append(String.format("        res = sol.%s(%s)\n", methodName, generateParamNames(sig)));
        // Output serialization
        if (sig.getReturnType().contains("TreeNode")) {
            sb.append("        print(res.val)\n");
        } else if (sig.getReturnType().contains("ListNode")) {
            sb.append("        print(json.dumps(list_to_array(res)))\n");
        } else if (sig.getReturnType().equals("bool") || sig.getReturnType().equals("boolean")) {
            sb.append("        print(\"True\" if res else \"False\")\n");
        } else {
            sb.append("        print(json.dumps(res))\n");
        }
        sb.append("    except Exception as e:\n");
        sb.append("        print('ERROR:'+str(e), file=sys.stderr)\n");
        sb.append("        sys.exit(1)\n");
        sb.append("if __name__=='__main__': main()\n");
        return sb.toString();
    }

    // -------- JavaScript Wrapper --------
    private String wrapJavaScript(String userCode, String methodName, MethodSignature sig) {
        StringBuilder sb = new StringBuilder();
        sb.append("const fs = require('fs');\n");
        sb.append("let data = fs.readFileSync(0, 'utf-8').trim();\n");
        sb.append("let args = []; try { args = data && data!='[]'?JSON.parse(data):[]; } catch(e) { console.log('ERROR:'+e); process.exit(1); }\n");

        boolean needsTree = sig.getParameters().stream().anyMatch(p -> p.getType().contains("TreeNode")) || sig.getReturnType().contains("TreeNode");
        boolean needsListNode = sig.getParameters().stream().anyMatch(p -> p.getType().contains("ListNode")) || sig.getReturnType().contains("ListNode");
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
            } else if (type.contains("TreeNode")) {
                assign = String.format("const %s = Array.isArray(args[%d]) ? arrayToTree(args[%d]) : new TreeNode(args[%d]);\n", name, i, i, i);
            } else if (type.contains("ListNode")) {
                assign = String.format("const %s = arrayToList(args[%d]);\n", name, i);
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
        } else {
            sb.append("console.log(JSON.stringify(res));\n");
        }
        sb.append("process.on('uncaughtException', function(err) { console.log('ERROR:' + err.message); process.exit(1); });\n");
        return sb.toString();
    }

    // -------- C++ Wrapper --------
    private String wrapCpp(String userCode, String methodName, MethodSignature sig) {
        StringBuilder sb = new StringBuilder();
        sb.append("// judge0: -std=c++14\n");
        sb.append("#include <bits/stdc++.h>\n");
        sb.append("using namespace std;\n\n");
        boolean needsTree = sig.getParameters().stream().anyMatch(p -> p.getType().contains("TreeNode")) || sig.getReturnType().contains("TreeNode");
        boolean needsListNode = sig.getParameters().stream().anyMatch(p -> p.getType().contains("ListNode")) || sig.getReturnType().contains("ListNode");
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
        // ... existing code for multi-param ...
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
            // Print root->val or serialize as needed
            sb.append("        if (res) cout << res->val << endl;\n");
        } else if (retType.contains("ListNode")) {
            // Serialize list to array
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
    }
}
