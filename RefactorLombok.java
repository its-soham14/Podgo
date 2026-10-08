import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;
import java.util.List;
import java.util.ArrayList;

public class RefactorLombok {
    public static void main(String[] args) throws IOException {
        Path startPath = Paths.get("E:\\PodGo\\podgo-backend\\src\\main\\java\\com\\podgo\\modules");
        try (Stream<Path> stream = Files.walk(startPath)) {
            stream.filter(Files::isRegularFile)
                  .filter(path -> path.toString().endsWith(".java"))
                  .forEach(RefactorLombok::processFile);
        }
    }
    
    private static void processFile(Path path) {
        try {
            String content = Files.readString(path);
            if (content.contains("@Entity")) {
                if (!content.contains("lombok.Data")) {
                    content = content.replace("import jakarta.persistence.*;", "import jakarta.persistence.*;\nimport lombok.Data;\nimport lombok.NoArgsConstructor;");
                }
                if (!content.contains("@Data")) {
                    content = content.replace("@Entity", "@Data\n@NoArgsConstructor\n@Entity");
                }
                
                String className = path.getFileName().toString().replace(".java", "");
                String[] lines = content.split("\n");
                List<String> newLines = new ArrayList<>();
                boolean truncating = false;
                
                for (String line : lines) {
                    if (line.contains("public " + className + "()") || line.contains("public Long getId()") || line.contains("public String get") || line.contains("public void set")) {
                        if (!truncating) {
                            truncating = true;
                        }
                    }
                    if (!truncating) {
                        newLines.add(line);
                    }
                }
                
                if (truncating) {
                    // remove trailing empty lines
                    while (!newLines.isEmpty() && newLines.get(newLines.size()-1).trim().isEmpty()) {
                        newLines.remove(newLines.size()-1);
                    }
                    newLines.add("}");
                }
                
                Files.writeString(path, String.join("\n", newLines));
                System.out.println("Refactored " + path.getFileName());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
