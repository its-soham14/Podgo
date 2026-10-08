import os
import re

directory = r"E:\PodGo\podgo-backend\src\main\java\com\podgo\modules"

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".java"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            if "@Entity" in content:
                # Add imports
                if "lombok.Data" not in content:
                    content = content.replace("import jakarta.persistence.*;", "import jakarta.persistence.*;\nimport lombok.Data;\nimport lombok.NoArgsConstructor;")
                
                # Add annotations
                if "@Data" not in content:
                    content = content.replace("@Entity", "@Data\n@NoArgsConstructor\n@Entity")
                
                class_name = file.replace(".java", "")
                
                lines = content.split('\n')
                new_lines = []
                truncating = False
                
                for line in lines:
                    if f"public {class_name}()" in line or "public Long getId()" in line or "public String get" in line or "public void set" in line:
                        if not truncating:
                            truncating = True
                    
                    if not truncating:
                        new_lines.append(line)
                
                # Ensure it ends with a closing brace if we truncated
                if truncating:
                    # Remove trailing empty lines
                    while new_lines and new_lines[-1].strip() == "":
                        new_lines.pop()
                    new_lines.append("}")
                
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write('\n'.join(new_lines))
                
                print(f"Refactored {file}")
