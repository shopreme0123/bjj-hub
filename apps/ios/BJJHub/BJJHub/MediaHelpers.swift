import Foundation
import AVFoundation
import UIKit

enum LocalVideoStore {
    static func videoURL(for techniqueId: String) -> URL? {
        techniqueVideoURLs(for: techniqueId).first
    }

    static func saveVideo(from sourceURL: URL, techniqueId: String) throws {
        try saveTechniqueVideos(from: [sourceURL], titles: [""], techniqueId: techniqueId)
    }

    static func saveVideo(data: Data, techniqueId: String) throws {
        let fileManager = FileManager.default
        let tempFolder = techniqueVideoTempDirectory().appendingPathComponent(UUID().uuidString, isDirectory: true)
        try fileManager.createDirectory(at: tempFolder, withIntermediateDirectories: true)
        let tempFile = tempFolder.appendingPathComponent("video-0.mov")
        try data.write(to: tempFile, options: [.atomic])
        try saveTechniqueVideos(from: [tempFile], titles: [""], techniqueId: techniqueId)
        try? fileManager.removeItem(at: tempFolder)
    }

    static func deleteVideo(for techniqueId: String) {
        deleteTechniqueVideos(for: techniqueId)
    }

    static func techniqueVideoURLs(for techniqueId: String) -> [URL] {
        let fileManager = FileManager.default
        let folder = techniqueVideoDirectory(for: techniqueId)
        if fileManager.fileExists(atPath: folder.path) {
            let contents = try? fileManager.contentsOfDirectory(at: folder, includingPropertiesForKeys: nil)
            let videos = contents?.filter { $0.pathExtension == "mov" }.sorted { $0.lastPathComponent < $1.lastPathComponent } ?? []
            if !videos.isEmpty {
                return videos
            }
        }

        if let legacyURL = techniqueLegacyVideoURL(for: techniqueId) {
            do {
                try fileManager.createDirectory(at: folder, withIntermediateDirectories: true)
                let destination = folder.appendingPathComponent("video-0.mov")
                if fileManager.fileExists(atPath: destination.path) {
                    try fileManager.removeItem(at: destination)
                }
                try fileManager.copyItem(at: legacyURL, to: destination)
                let metadata = try JSONEncoder().encode([""])
                try metadata.write(to: techniqueVideoMetadataURL(for: techniqueId), options: [.atomic])
                try? fileManager.removeItem(at: legacyURL)
                return [destination]
            } catch {
                return [legacyURL]
            }
        }

        return []
    }

    static func techniqueVideoTitles(for techniqueId: String) -> [String] {
        let url = techniqueVideoMetadataURL(for: techniqueId)
        guard FileManager.default.fileExists(atPath: url.path) else { return [] }
        do {
            let data = try Data(contentsOf: url)
            return try JSONDecoder().decode([String].self, from: data)
        } catch {
            return []
        }
    }

    static func saveTechniqueVideos(from sourceURLs: [URL], titles: [String], techniqueId: String) throws {
        let folder = techniqueVideoDirectory(for: techniqueId)
        let fileManager = FileManager.default
        let tempFolder = techniqueVideoTempDirectory().appendingPathComponent(UUID().uuidString, isDirectory: true)

        try fileManager.createDirectory(at: tempFolder, withIntermediateDirectories: true)
        for (index, sourceURL) in sourceURLs.enumerated() {
            let tempDestination = tempFolder.appendingPathComponent("video-\(index).mov")
            try fileManager.copyItem(at: sourceURL, to: tempDestination)
        }
        let metadataURL = tempFolder.appendingPathComponent("metadata.json")
        let metadata = try JSONEncoder().encode(titles)
        try metadata.write(to: metadataURL, options: [.atomic])

        if fileManager.fileExists(atPath: folder.path) {
            try fileManager.removeItem(at: folder)
        }
        try fileManager.createDirectory(at: folder, withIntermediateDirectories: true)
        for item in (try fileManager.contentsOfDirectory(at: tempFolder, includingPropertiesForKeys: nil)) {
            let destination = folder.appendingPathComponent(item.lastPathComponent)
            try fileManager.moveItem(at: item, to: destination)
        }
        try? fileManager.removeItem(at: tempFolder)

        if let legacyURL = techniqueLegacyVideoURL(for: techniqueId) {
            try? fileManager.removeItem(at: legacyURL)
        }
    }

    static func deleteTechniqueVideos(for techniqueId: String) {
        let fileManager = FileManager.default
        let folder = techniqueVideoDirectory(for: techniqueId)
        try? fileManager.removeItem(at: folder)
        if let legacyURL = techniqueLegacyVideoURL(for: techniqueId) {
            try? fileManager.removeItem(at: legacyURL)
        }
    }

    private static func techniqueStorageDirectory() -> URL {
        let base = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let folder = base.appendingPathComponent("technique-videos", isDirectory: true)
        if !FileManager.default.fileExists(atPath: folder.path) {
            try? FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        }
        return folder
    }

    private static func techniqueVideoDirectory(for techniqueId: String) -> URL {
        techniqueStorageDirectory().appendingPathComponent(techniqueId, isDirectory: true)
    }

    private static func techniqueVideoMetadataURL(for techniqueId: String) -> URL {
        techniqueVideoDirectory(for: techniqueId).appendingPathComponent("metadata.json")
    }

    private static func techniqueVideoTempDirectory() -> URL {
        let base = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        return base.appendingPathComponent("technique-videos-temp", isDirectory: true)
    }

    private static func techniqueLegacyVideoURL(for techniqueId: String) -> URL? {
        let url = techniqueStorageDirectory().appendingPathComponent("\(techniqueId).mov")
        return FileManager.default.fileExists(atPath: url.path) ? url : nil
    }

    // Diary video storage methods
    static func diaryVideoURLs(for logId: String) -> [URL] {
        let folder = diaryVideoDirectory(for: logId)
        guard FileManager.default.fileExists(atPath: folder.path) else { return [] }

        let contents = try? FileManager.default.contentsOfDirectory(at: folder, includingPropertiesForKeys: nil)
        return contents?.filter { $0.pathExtension == "mov" }.sorted { $0.lastPathComponent < $1.lastPathComponent } ?? []
    }

    static func diaryVideoTitles(for logId: String) -> [String] {
        let url = diaryVideoMetadataURL(for: logId)
        guard FileManager.default.fileExists(atPath: url.path) else { return [] }
        do {
            let data = try Data(contentsOf: url)
            return try JSONDecoder().decode([String].self, from: data)
        } catch {
            return []
        }
    }

    static func saveDiaryVideos(from sourceURLs: [URL], titles: [String], logId: String) throws {
        let folder = diaryVideoDirectory(for: logId)
        let fileManager = FileManager.default
        let tempFolder = diaryVideoTempDirectory().appendingPathComponent(UUID().uuidString, isDirectory: true)

        try fileManager.createDirectory(at: tempFolder, withIntermediateDirectories: true)
        for (index, sourceURL) in sourceURLs.enumerated() {
            let tempDestination = tempFolder.appendingPathComponent("video-\(index).mov")
            try fileManager.copyItem(at: sourceURL, to: tempDestination)
        }
        let metadataURL = tempFolder.appendingPathComponent("metadata.json")
        let metadata = try JSONEncoder().encode(titles)
        try metadata.write(to: metadataURL, options: [.atomic])

        if fileManager.fileExists(atPath: folder.path) {
            try fileManager.removeItem(at: folder)
        }
        try fileManager.createDirectory(at: folder, withIntermediateDirectories: true)
        for item in (try fileManager.contentsOfDirectory(at: tempFolder, includingPropertiesForKeys: nil)) {
            let destination = folder.appendingPathComponent(item.lastPathComponent)
            try fileManager.moveItem(at: item, to: destination)
        }
        try? fileManager.removeItem(at: tempFolder)
    }

    static func deleteDiaryVideos(for logId: String) {
        let folder = diaryVideoDirectory(for: logId)
        try? FileManager.default.removeItem(at: folder)
    }

    private static func diaryVideoDirectory(for logId: String) -> URL {
        let base = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let folder = base.appendingPathComponent("diary-videos", isDirectory: true)
            .appendingPathComponent(logId, isDirectory: true)
        return folder
    }

    private static func diaryVideoMetadataURL(for logId: String) -> URL {
        diaryVideoDirectory(for: logId).appendingPathComponent("metadata.json")
    }

    private static func diaryVideoTempDirectory() -> URL {
        let base = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        return base.appendingPathComponent("diary-videos-temp", isDirectory: true)
    }
}

enum VideoThumbnailGenerator {
    static func thumbnail(for url: URL) async -> UIImage? {
        let asset = AVURLAsset(url: url)
        let generator = AVAssetImageGenerator(asset: asset)
        generator.appliesPreferredTrackTransform = true
        let time = CMTime(seconds: 0.1, preferredTimescale: 600)

        return await withCheckedContinuation { continuation in
            generator.generateCGImageAsynchronously(for: time) { cgImage, _, _ in
                if let cgImage {
                    continuation.resume(returning: UIImage(cgImage: cgImage))
                } else {
                    continuation.resume(returning: nil)
                }
            }
        }
    }
}

enum LocalAvatarStore {
    static func avatarURL(for userId: String) -> URL? {
        let url = storageDirectory().appendingPathComponent("\(userId).jpg")
        return FileManager.default.fileExists(atPath: url.path) ? url : nil
    }

    static func saveAvatar(data: Data, userId: String) throws {
        let destination = storageDirectory().appendingPathComponent("\(userId).jpg")
        if FileManager.default.fileExists(atPath: destination.path) {
            try FileManager.default.removeItem(at: destination)
        }
        try data.write(to: destination, options: [.atomic])
    }

    static func deleteAvatar(for userId: String) {
        let destination = storageDirectory().appendingPathComponent("\(userId).jpg")
        try? FileManager.default.removeItem(at: destination)
    }

    private static func storageDirectory() -> URL {
        let base = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let folder = base.appendingPathComponent("avatars", isDirectory: true)
        if !FileManager.default.fileExists(atPath: folder.path) {
            try? FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        }
        return folder
    }
}
