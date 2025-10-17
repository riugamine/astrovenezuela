"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import dynamic from 'next/dynamic';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold,
  faItalic,
  faUnderline,
  faList,
  faListOl,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faLink,
  faUnlink,
  faPalette,
  faHeading,
  faParagraph
} from '@fortawesome/free-solid-svg-icons';
import { useState, useCallback } from 'react';
import { sanitizeHtml } from '@/lib/utils/sanitize-html';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Componente interno que se renderiza solo en el cliente
function RichTextEditorInternal({ 
  value, 
  onChange, 
  placeholder = "Escribe la descripción del producto...",
  className = ""
}: RichTextEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
    ],
    content: value,
    immediatelyRender: false, // Soluciona el problema de SSR
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Sanitizar el HTML antes de pasarlo al onChange
      try {
        const sanitizedHtml = sanitizeHtml(html);
        onChange(sanitizedHtml);
      } catch (error) {
        console.error('Error sanitizing HTML:', error);
        // Si hay error en sanitización, usar contenido anterior
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 border border-gray-300 rounded-md',
      },
    },
  });

  const setLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setIsLinkModalOpen(false);
    }
  }, [editor, linkUrl]);

  const unsetLink = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  }, [editor]);

  const setTextColor = useCallback((color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
      setIsColorPickerOpen(false);
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    icon, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: any; 
    title: string;
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      <FontAwesomeIcon icon={icon} className="h-4 w-4" />
    </Button>
  );

  const colors = [
    '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB',
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    '#EC4899', '#F43F5E'
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border border-gray-300 rounded-md bg-gray-50">
        {/* Formato básico */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={faBold}
            title="Negrita"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={faItalic}
            title="Cursiva"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            icon={faUnderline}
            title="Subrayado"
          />
        </div>

        {/* Encabezados */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive('paragraph')}
            icon={faParagraph}
            title="Párrafo"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            icon={faHeading}
            title="Encabezado 1"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            icon={faHeading}
            title="Encabezado 2"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            icon={faHeading}
            title="Encabezado 3"
          />
        </div>

        {/* Listas */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={faList}
            title="Lista con viñetas"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={faListOl}
            title="Lista numerada"
          />
        </div>

        {/* Alineación */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            icon={faAlignLeft}
            title="Alinear a la izquierda"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            icon={faAlignCenter}
            title="Centrar"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            icon={faAlignRight}
            title="Alinear a la derecha"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            icon={faAlignJustify}
            title="Justificar"
          />
        </div>

        {/* Enlaces */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => setIsLinkModalOpen(true)}
            isActive={editor.isActive('link')}
            icon={faLink}
            title="Agregar enlace"
          />
          <ToolbarButton
            onClick={unsetLink}
            icon={faUnlink}
            title="Quitar enlace"
          />
        </div>

        {/* Color de texto */}
        <div className="flex gap-1 relative">
          <ToolbarButton
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            icon={faPalette}
            title="Color de texto"
          />
          {isColorPickerOpen && (
            <div className="absolute top-10 left-0 z-10 bg-white border border-gray-300 rounded-md p-2 shadow-lg">
              <div className="grid grid-cols-6 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => setTextColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="border border-gray-300 rounded-md">
        <EditorContent 
          editor={editor} 
          placeholder={placeholder}
        />
      </div>

      {/* Modal de enlace */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Agregar Enlace</h3>
            <Input
              type="url"
              placeholder="https://ejemplo.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkUrl('');
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={setLink}
                disabled={!linkUrl.trim()}
              >
                Agregar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Exportar el componente con dynamic import para evitar problemas de SSR
export const RichTextEditor = dynamic(
  () => Promise.resolve(RichTextEditorInternal),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1 p-2 border border-gray-300 rounded-md bg-gray-50">
          <div className="text-sm text-gray-500">Cargando editor...</div>
        </div>
        <div className="border border-gray-300 rounded-md min-h-[200px] p-4 flex items-center justify-center">
          <div className="text-gray-500">Preparando editor de texto...</div>
        </div>
      </div>
    )
  }
);
