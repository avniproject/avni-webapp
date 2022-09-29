package org.avni.server.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.FileImageInputStream;
import javax.imageio.stream.ImageInputStream;
import java.awt.*;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Iterator;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static java.lang.String.format;

public class AvniFiles {

    private static final Logger logger = LoggerFactory.getLogger(AvniFiles.class.getName());

    /**
     * Sources:
     * http://stackoverflow.com/q/9354747
     * https://stackoverflow.com/a/9359622
     * https://en.wikipedia.org/wiki/JPEG_File_Interchange_Format#File_format_structure
     *
     * @see java.net.URLConnection#guessContentTypeFromStream(InputStream)
     */
    static public ImageType guessImageTypeFromStream(File tempSourceFile) throws IOException {
        ImageInputStream is = new FileImageInputStream(tempSourceFile);

        is.mark();
        int c1 = is.read();
        int c2 = is.read();
        int c3 = is.read();
        int c4 = is.read();
        int c5 = is.read();
        int c6 = is.read();
        int c7 = is.read();
        int c8 = is.read();
        int c9 = is.read();
        int c10 = is.read();
        int c11 = is.read();
        is.reset();

        if (c1 == 'B' && c2 == 'M') {
            return ImageType.BMP;
        }

        if (c1 == 'G' && c2 == 'I' && c3 == 'F' && c4 == '8') {
            return ImageType.GIF;
        }

        if (c1 == 137 && c2 == 80 && c3 == 78 &&
                c4 == 71 && c5 == 13 && c6 == 10 &&
                c7 == 26 && c8 == 10) {
            return ImageType.PNG;
        }

        if (c1 == 0xFF && c2 == 0xD8 && c3 == 0xFF) {
            if (c4 == 0xE0 || c4 == 0xEE) {
                return ImageType.JPEG;
            }

            /**
             * File format used by digital cameras to store images.
             * Exif Format can be read by any application supporting
             * JPEG. Exif Spec can be found at:
             * http://www.pima.net/standards/it10/PIMA15740/Exif_2-1.PDF
             */
            if ((c4 == 0xE1) &&
                    (c7 == 'E' && c8 == 'x' && c9 == 'i' && c10 == 'f' &&
                            c11 == 0)) {
                return ImageType.JPEG;
            }
        }

        if (c1 == 0xFF && c2 == 0xD8 &&
                ((c7 == 0x4A && c8 == 0x46 && c9 == 0x49 && c10 == 0x46)
                        || (c7 == 0x45 && c8 == 0x78 && c9 == 0x69 && c10 == 0x66)
                ) && c11 == 0x00) {
            return ImageType.JPEG;
        }

        return ImageType.Unknown;
    }

    public enum ImageType {
        Unknown(""),
        JPEG(".jpg"),
        PNG(".png"),
        GIF(".gif"),
        BMP(".bmp");

        public final String EXT;

        ImageType(String ext) {
            this.EXT = ext;
        }

    }

    /**
     * Sources:
     * https://stackoverflow.com/a/12164026
     *
     * Gets image dimensions for given file
     * @param imgFile image file
     * @return dimensions of image
     * @throws IOException if the file is not a known image
     */
    public static Dimension getImageDimension(File imgFile, ImageType type) throws IOException {
        Iterator<ImageReader> iter = ImageIO.getImageReadersBySuffix(type.toString().toLowerCase());
        while(iter.hasNext()) {
            ImageReader reader = iter.next();
            try {
                ImageInputStream stream = new FileImageInputStream(imgFile);
                reader.setInput(stream);
                int width = reader.getWidth(reader.getMinIndex());
                int height = reader.getHeight(reader.getMinIndex());
                return new Dimension(width, height);
            } catch (IOException e) {
                logger.warn("Error reading: " + imgFile.getAbsolutePath(), e);
            } finally {
                reader.dispose();
            }
        }

        throw new IOException("Not a known image file: " + imgFile.getAbsolutePath());
    }

    private static File getFile(MultipartFile file, File tempFile) throws IOException {
        try {
            FileOutputStream fos;
            fos = new FileOutputStream(tempFile);
            fos.write(file.getBytes());
            fos.close();
        } catch (IOException e) {
            e.printStackTrace();
            throw new IOException(
                    format("Unable to create temp file %s. Error: %s", file.getOriginalFilename(), e.getMessage()));
        }
        return tempFile;
    }

    public static File convertMultiPartToFile(MultipartFile file, String ext) throws IOException {
        File tempFile = File.createTempFile(UUID.randomUUID().toString(), ext);
        return getFile(file, tempFile);
    }

    public static File convertMultiPartToZip(MultipartFile file) throws IOException {
        return convertMultiPartToFile(file, ".zip");
    }

    public static double getSizeInKB(MultipartFile file) {
        return file.getSize() * 0.0009765625;
    }

    public static void extractFileToPath(MultipartFile file, Path tmpPath) throws IOException {
        logger.info(format("Extracting zip in path %s", tmpPath.toString()));
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(file.getBytes()))) {
            ZipEntry zipEntry = zis.getNextEntry();
            while (zipEntry != null) {
                boolean isDirectory = false;
                if (zipEntry.getName().endsWith(File.separator)) {
                    isDirectory = true;
                }
                Path newPath = zipSlipProtect(zipEntry, tmpPath);
                if (isDirectory) {
                    Files.createDirectories(newPath);
                } else {
                    if (newPath.getParent() != null) {
                        if (Files.notExists(newPath.getParent())) {
                            Files.createDirectories(newPath.getParent());
                        }
                    }
                    Files.copy(zis, newPath, StandardCopyOption.REPLACE_EXISTING);
                }
                zipEntry = zis.getNextEntry();
            }
            zis.closeEntry();
        }
    }

    private static Path zipSlipProtect(ZipEntry zipEntry, Path targetDir) throws IOException {
        Path targetDirResolved = targetDir.resolve(zipEntry.getName());
        Path normalizePath = targetDirResolved.normalize();
        if (!normalizePath.startsWith(targetDir)) {
            throw new IOException("Bad zip entry: " + zipEntry.getName());
        }
        return normalizePath;
    }
}
